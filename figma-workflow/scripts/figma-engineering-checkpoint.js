const fs = require("node:fs");
const path = require("node:path");

function exists(filePath) {
  return fs.existsSync(filePath);
}

function hasSnapshots(featureDir) {
  const snapshotsDir = path.join(featureDir, ".figma-cache", "snapshots");
  if (!exists(snapshotsDir)) return false;
  const entries = fs.readdirSync(snapshotsDir, { withFileTypes: true }).filter((entry) => entry.isDirectory());
  return entries.length >= 2;
}

function readTextIfExists(filePath) {
  return exists(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function hasUnknownOrOpenQuestions(featureDir) {
  const candidates = [
    "component-mapping.md",
    "open-questions.md",
    "design-diff.md",
  ];
  return candidates.some((fileName) => {
    const text = readTextIfExists(path.join(featureDir, fileName));
    return /unknown|Open Questions|- \[ \]/i.test(text);
  });
}

function productStatus(featureDir, product) {
  const products = product.split(",").map((name) => name.trim()).filter(Boolean);
  return products.every((fileName) => exists(path.join(featureDir, fileName))) ? "generated" : "missing";
}

function hasSkipAudit(featureDir, checkpoint, skill) {
  const audit = readTextIfExists(path.join(featureDir, "inputs.md"));
  if (!audit) return false;

  return audit
    .split(/^## /m)
    .some((block) => block.includes("figma-workflow@engineering-checkpoint") &&
      block.includes(`- checkpoint: ${checkpoint}`) &&
      block.includes(`- skill: ${skill}`));
}

function applyAuditedSkips(featureDir, checkpoint, items) {
  return items.map((item) => {
    if (item.status !== "missing" || !hasSkipAudit(featureDir, checkpoint, item.skill)) {
      return item;
    }

    return { ...item, status: "skipped" };
  });
}

function inferEngineeringCheckpoint(featureDir, options = {}) {
  const checkpoint = options.checkpoint || "pre-handoff";
  const snapshots = hasSnapshots(featureDir);
  const unknowns = hasUnknownOrOpenQuestions(featureDir);
  const items = [];

  items.push({
    label: "Design diff",
    skill: "figma-design-diff",
    product: "design-diff.md",
    status: snapshots ? productStatus(featureDir, "design-diff.md") : "not_applicable",
    recommendation: snapshots ? "required_prompt" : "available",
    reason: snapshots ? "cache snapshots detected" : "no baseline/current snapshots detected",
    risk: "design changes not reviewed before handoff",
  });

  items.push({
    label: "UI handoff",
    skill: "figma-ui-handoff",
    product: "ui-handoff.md",
    status: unknowns ? productStatus(featureDir, "ui-handoff.md") : "not_applicable",
    recommendation: unknowns ? "recommended" : "available",
    reason: unknowns ? "unknown or open questions detected" : "no unknown or open questions detected",
    risk: "design/product follow-up not captured",
  });

  items.push({
    label: "Assets / visual validation",
    skill: "figma-assets-validate",
    product: "assets-manifest.md, validation-report.md",
    status: checkpoint === "pre-handoff"
      ? productStatus(featureDir, "assets-manifest.md, validation-report.md")
      : "not_applicable",
    recommendation: checkpoint === "pre-handoff" ? "required_prompt" : "available",
    reason: checkpoint === "pre-handoff"
      ? "pre-handoff assets, visual baselines, and spec-snapshot checks are recommended before planning"
      : "available when the user asks about assets, snapshots, or validation",
    risk: "assets, visual baselines, and spec-snapshot consistency not reviewed before handoff",
  });

  return { checkpoint, featureDir, items: applyAuditedSkips(featureDir, checkpoint, items) };
}

function isHandled(item) {
  return item.recommendation !== "required_prompt" || ["generated", "skipped", "not_applicable"].includes(item.status);
}

function canContinueToHandoff(state) {
  return state.items.every(isHandled);
}

function renderEngineeringCheckpoint(state) {
  const title = state.checkpoint === "pre-handoff"
    ? "交接前工程化检查:"
    : "流程中工程化检查:";
  const lines = [title, ""];

  for (const item of state.items) {
    lines.push(`[${item.skill}] ${item.label}`);
    lines.push(`  status: ${item.status}`);
    lines.push(`  recommendation: ${item.recommendation}`);
    lines.push(`  reason: ${item.reason}`);
    lines.push("  actions: [R] run  [V] view  [S] skip");
    lines.push("");
  }

  if (canContinueToHandoff(state)) {
    lines.push("[C] Continue to handoff menu");
  } else {
    lines.push("Handle required prompts before continuing to handoff.");
  }

  return lines.join("\n");
}

function appendSkipAudit(featureDir, options) {
  const now = options.now || new Date().toISOString();
  const continueField = options.continueField || "continue_to_handoff";
  const lines = [
    "",
    `## ${now} — figma-workflow@engineering-checkpoint`,
    "",
    `- checkpoint: ${options.checkpoint}`,
    `- phase_context: ${options.phaseContext}`,
    "- action: skip",
    "- skipped:",
  ];

  for (const item of options.skipped) {
    lines.push(`  - skill: ${item.skill}`);
    lines.push(`    product: ${item.product}`);
    lines.push(`    recommendation: ${item.recommendation}`);
    lines.push(`    reason: ${item.reason}`);
    lines.push(`    risk: ${item.risk}`);
  }

  lines.push(`- ${continueField}: true`);
  lines.push("");

  const inputsPath = path.join(featureDir, "inputs.md");
  fs.mkdirSync(featureDir, { recursive: true });
  fs.appendFileSync(inputsPath, lines.join("\n"));
}

function runCli(argv) {
  const [command, featureDir] = argv;
  if (command !== "summary" || !featureDir) {
    process.stderr.write("Usage: node figma-workflow/scripts/figma-engineering-checkpoint.js summary <featureDir>\n");
    return 1;
  }

  process.stdout.write(`${renderEngineeringCheckpoint(inferEngineeringCheckpoint(featureDir))}\n`);
  return 0;
}

module.exports = {
  appendSkipAudit,
  canContinueToHandoff,
  inferEngineeringCheckpoint,
  renderEngineeringCheckpoint,
};

if (require.main === module) {
  process.exitCode = runCli(process.argv.slice(2));
}
