const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function hashJson(value) {
  return `sha256:${crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex")}`;
}

function stableJson(value) {
  return JSON.stringify(value ?? null);
}

function getNodeText(node) {
  return node.text || node.characters || null;
}

function pickNodeFields(node, parentId) {
  return {
    id: node.id,
    name: node.name || "",
    type: node.type || "",
    parentId,
    text: getNodeText(node),
    bounds: node.bounds || node.absoluteBoundingBox || null,
    fills: node.fills || null,
    typography: node.typography || node.style || null,
    radius: node.radius || node.cornerRadius || null,
    spacing: node.spacing || null,
  };
}

function indexNodes(metadata) {
  const nodes = new Map();

  function visit(node, parentId, fallbackId) {
    if (!node) {
      return;
    }

    const id = node.id || fallbackId;
    nodes.set(id, pickNodeFields({ ...node, id }, parentId));

    const children = Array.isArray(node.children)
      ? node.children
      : Array.isArray(node.children_summary)
        ? node.children_summary
        : [];

    children.forEach((child, index) => {
      const childId = child.id || `${id}/${child.name || "node"}-${index}`;
      visit(child, id, childId);
    });
  }

  visit(metadata.node, null, "root");
  return nodes;
}

function diffNodes(beforeMetadata, afterMetadata) {
  const before = indexNodes(beforeMetadata);
  const after = indexNodes(afterMetadata);
  const addedNodes = [];
  const removedNodes = [];
  const changedNodes = [];

  for (const [id, afterNode] of after.entries()) {
    if (!before.has(id)) {
      addedNodes.push({
        id,
        name: afterNode.name,
        type: afterNode.type,
        parentId: afterNode.parentId,
        changeType: "node_added",
      });
    }
  }

  for (const [id, beforeNode] of before.entries()) {
    if (!after.has(id)) {
      removedNodes.push({
        id,
        name: beforeNode.name,
        type: beforeNode.type,
        parentId: beforeNode.parentId,
        changeType: "node_removed",
      });
      continue;
    }

    const afterNode = after.get(id);
    const changed =
      beforeNode.name !== afterNode.name ||
      beforeNode.type !== afterNode.type ||
      beforeNode.text !== afterNode.text ||
      stableJson(beforeNode.bounds) !== stableJson(afterNode.bounds);

    if (changed) {
      changedNodes.push({
        id,
        name: afterNode.name || beforeNode.name,
        changeType: "node_changed",
        before: beforeNode,
        after: afterNode,
      });
    }
  }

  return { addedNodes, removedNodes, changedNodes };
}

function diffText(beforeMetadata, afterMetadata) {
  const before = indexNodes(beforeMetadata);
  const after = indexNodes(afterMetadata);
  const changes = [];

  for (const [id, beforeNode] of before.entries()) {
    if (!after.has(id)) {
      continue;
    }

    const afterNode = after.get(id);
    if (beforeNode.text !== afterNode.text && (beforeNode.text || afterNode.text)) {
      changes.push({
        node: id,
        before: beforeNode.text || "",
        after: afterNode.text || "",
        recommendedAction: "Review Phase B and rerun Phase E",
      });
    }
  }

  return changes;
}

function diffLayout(beforeMetadata, afterMetadata) {
  const before = indexNodes(beforeMetadata);
  const after = indexNodes(afterMetadata);
  const changes = [];

  for (const [id, beforeNode] of before.entries()) {
    if (!after.has(id) || !beforeNode.bounds || !after.get(id).bounds) {
      continue;
    }

    const afterNode = after.get(id);
    for (const property of ["x", "y", "width", "height"]) {
      if (beforeNode.bounds[property] !== afterNode.bounds[property]) {
        changes.push({
          node: id,
          property,
          before: beforeNode.bounds[property],
          after: afterNode.bounds[property],
          recommendedAction: "Review Phase B and rerun Phase D/E",
        });
      }
    }
  }

  return changes;
}

function diffTokens(beforeContext, afterContext) {
  const before = beforeContext.tokens || {};
  const after = afterContext.tokens || {};
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort();

  return keys
    .filter((key) => stableJson(before[key]) !== stableJson(after[key]))
    .map((key) => ({
      tokenType: key,
      node: "design-context",
      before: before[key] ?? "",
      after: after[key] ?? "",
      recommendedAction: "Rerun Phase D and Phase E",
    }));
}

function recommendRerunPhases(diff) {
  const recommendations = new Map();
  const add = (phase, recommendation, reason) => {
    if (!recommendations.has(phase)) {
      recommendations.set(phase, { phase, recommendation, reason });
    }
  };

  if (diff.addedNodes?.length || diff.removedNodes?.length) {
    add("B", "rerun", "Nodes added or removed");
    add("C-low", "rerun", "UI/API binding may have changed");
    add("D", "rerun", "Token extraction may be stale");
    add("E", "rerun", "Implementation spec may be stale");
  }

  if (diff.textChanges?.length) {
    add("B", "review", "Text changed");
    add("E", "rerun", "Implementation spec may be stale");
  }

  if (diff.layoutChanges?.length) {
    add("B", "review", "Layout changed");
    add("D", "rerun", "Design tokens may be stale");
    add("E", "rerun", "Implementation spec may be stale");
  }

  if (diff.tokenChanges?.length) {
    add("D", "rerun", "Visual token changed");
    add("E", "rerun", "Implementation spec may be stale");
  }

  if (diff.assetChanges?.length) {
    add("D", "review", "Asset references changed");
    add("P15 assets", "review", "Asset manifest may need refresh");
  }

  if (diff.unknownChanges?.length) {
    add("Manual review", "review", "Unknown evidence changed");
  }

  return ["B", "C-low", "D", "E", "P15 assets", "Manual review"]
    .filter((phase) => recommendations.has(phase))
    .map((phase) => recommendations.get(phase));
}

function countSeverity(diff) {
  return {
    high: (diff.addedNodes?.length || 0) + (diff.removedNodes?.length || 0),
    medium: (diff.textChanges?.length || 0) + (diff.layoutChanges?.length || 0) + (diff.tokenChanges?.length || 0),
    low: (diff.assetChanges?.length || 0) + (diff.unknownChanges?.length || 0),
  };
}

function tableRows(rows, formatter, emptyCells) {
  if (!rows.length) {
    return `| ${emptyCells.join(" | ")} |\n`;
  }

  return rows.map(formatter).join("\n") + "\n";
}

function renderDesignDiffMarkdown(diff) {
  const severity = countSeverity(diff);
  const recommendations = diff.recommendations || recommendRerunPhases(diff);
  const compared = diff.comparedSnapshots || [
    { label: "baseline", capturedAt: "unknown", source: diff.baselineSnapshot || "baseline", contentHash: "" },
    { label: "current", capturedAt: "unknown", source: diff.currentSnapshot || "current", contentHash: "" },
  ];

  return [
    `# Design Diff — ${diff.feature}`,
    "",
    `> Generated by figma-design-diff@0.1.0 at ${diff.generatedAt || "unknown"}`,
    `> Figma: ${diff.fileKey} / ${diff.nodeId}`,
    `> Baseline: ${diff.baselineSnapshot}`,
    `> Current: ${diff.currentSnapshot}`,
    "",
    "## Summary",
    "",
    "| Severity | Count | Notes |",
    "|---|---:|---|",
    `| high | ${severity.high} | Structural changes |`,
    `| medium | ${severity.medium} | Text, layout, or token changes |`,
    `| low | ${severity.low} | Asset or unknown changes |`,
    "",
    "## Compared Snapshots",
    "",
    "| Snapshot | Captured At | Source | Content Hash |",
    "|---|---|---|---|",
    ...compared.map((item) => `| ${item.label} | ${item.capturedAt} | ${item.source} | ${item.contentHash} |`),
    "",
    "## Changed Nodes",
    "",
    "| Node | Change Type | Before | After | Impact |",
    "|---|---|---|---|---|",
    tableRows(
      diff.changedNodes || [],
      (node) => `| ${node.id} | ${node.changeType} | ${node.before.name} | ${node.after.name} | Phase B / E may need rerun |`,
      ["-", "-", "-", "-", "-"],
    ).trimEnd(),
    "",
    "## Added Nodes",
    "",
    "| Node | Type | Parent | Likely Module |",
    "|---|---|---|---|",
    tableRows(
      diff.addedNodes || [],
      (node) => `| ${node.id} | ${node.type} | ${node.parentId || "-"} | unknown |`,
      ["-", "-", "-", "-"],
    ).trimEnd(),
    "",
    "## Removed Nodes",
    "",
    "| Node | Type | Previous Parent | Likely Module |",
    "|---|---|---|---|",
    tableRows(
      diff.removedNodes || [],
      (node) => `| ${node.id} | ${node.type} | ${node.parentId || "-"} | unknown |`,
      ["-", "-", "-", "-"],
    ).trimEnd(),
    "",
    "## Text Changes",
    "",
    "| Node | Before | After | Recommended Action |",
    "|---|---|---|---|",
    tableRows(
      diff.textChanges || [],
      (item) => `| ${item.node} | ${item.before} | ${item.after} | ${item.recommendedAction} |`,
      ["-", "-", "-", "-"],
    ).trimEnd(),
    "",
    "## Layout Changes",
    "",
    "| Node | Property | Before | After | Recommended Action |",
    "|---|---|---|---|---|",
    tableRows(
      diff.layoutChanges || [],
      (item) => `| ${item.node} | ${item.property} | ${item.before} | ${item.after} | ${item.recommendedAction} |`,
      ["-", "-", "-", "-", "-"],
    ).trimEnd(),
    "",
    "## Visual Token Signals",
    "",
    "| Token Type | Node | Before | After | Recommended Action |",
    "|---|---|---|---|---|",
    tableRows(
      diff.tokenChanges || [],
      (item) => `| ${item.tokenType} | ${item.node} | ${item.before} | ${item.after} | ${item.recommendedAction} |`,
      ["-", "-", "-", "-", "-"],
    ).trimEnd(),
    "",
    "## Asset Signals",
    "",
    "| Asset | Change | Recommended Action |",
    "|---|---|---|",
    tableRows(diff.assetChanges || [], (item) => `| ${item.asset} | ${item.change} | ${item.recommendedAction} |`, ["-", "-", "-"]).trimEnd(),
    "",
    "## Recommended Rerun Phases",
    "",
    "| Phase | Recommendation | Reason |",
    "|---|---|---|",
    tableRows(
      recommendations,
      (item) => `| ${item.phase} | ${item.recommendation} | ${item.reason} |`,
      ["-", "-", "-"],
    ).trimEnd(),
    "",
    "## Open Questions",
    "",
    "- [ ] Review unknown or high-impact changes before coding.",
    "",
  ].join("\n");
}

function findFirstFile(dir, prefix) {
  const direct = fs.readdirSync(dir).find((file) => file.startsWith(prefix) && file.endsWith(".json"));
  if (direct) {
    return path.join(dir, direct);
  }
  return null;
}

function readSnapshot(snapshotDir) {
  const metadataPath = findFirstFile(snapshotDir, "metadata.");
  const contextPath = findFirstFile(snapshotDir, "design-context.");

  if (!metadataPath) {
    throw new Error(`Missing metadata snapshot in ${snapshotDir}`);
  }

  return {
    id: path.basename(snapshotDir),
    metadata: readJson(metadataPath),
    context: contextPath ? readJson(contextPath) : {},
    metadataPath,
    contextPath,
  };
}

function buildDiffFromSnapshots(beforeDir, afterDir) {
  const before = readSnapshot(beforeDir);
  const after = readSnapshot(afterDir);

  if (before.metadata.file_key !== after.metadata.file_key || before.metadata.node_id !== after.metadata.node_id) {
    throw new Error("P13 only supports diffing the same file_key and node_id");
  }

  const nodeDiff = diffNodes(before.metadata, after.metadata);
  const textChanges = diffText(before.metadata, after.metadata);
  const layoutChanges = diffLayout(before.metadata, after.metadata);
  const tokenChanges = diffTokens(before.context, after.context);
  const result = {
    feature: "sales-workbench",
    fileKey: after.metadata.file_key,
    nodeId: after.metadata.node_id,
    generatedAt: after.metadata.captured_at || after.context.captured_at || "2026-05-21T11:20:00+08:00",
    baselineSnapshot: before.id,
    currentSnapshot: after.id,
    comparedSnapshots: [
      {
        label: "baseline",
        capturedAt: before.metadata.captured_at || before.context.captured_at || "unknown",
        source: beforeDir,
        contentHash: hashJson({ metadata: before.metadata, context: before.context }),
      },
      {
        label: "current",
        capturedAt: after.metadata.captured_at || after.context.captured_at || "unknown",
        source: afterDir,
        contentHash: hashJson({ metadata: after.metadata, context: after.context }),
      },
    ],
    ...nodeDiff,
    textChanges,
    layoutChanges,
    tokenChanges,
    assetChanges: [],
    unknownChanges: [],
  };
  result.recommendations = recommendRerunPhases(result);
  return result;
}

function runCli(argv) {
  const [beforeDir, afterDir] = argv;
  if (!beforeDir || !afterDir) {
    process.stderr.write("Usage: node figma-workflow/scripts/figma-diff.js <baselineSnapshotDir> <currentSnapshotDir>\n");
    return 1;
  }

  const diff = buildDiffFromSnapshots(beforeDir, afterDir);
  process.stdout.write(renderDesignDiffMarkdown(diff));
  return 0;
}

module.exports = {
  buildDiffFromSnapshots,
  diffLayout,
  diffNodes,
  diffText,
  diffTokens,
  hashJson,
  indexNodes,
  readJson,
  recommendRerunPhases,
  renderDesignDiffMarkdown,
};

if (require.main === module) {
  process.exitCode = runCli(process.argv.slice(2));
}
