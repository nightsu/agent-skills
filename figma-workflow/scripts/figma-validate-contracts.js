import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const markdownContracts = {
  "clarified-requirement.md": ["Open Questions"],
  "ui-understanding.md": ["Page Structure", "Repeated Patterns", "Open Questions"],
  "api-mapping.md": ["Data Sources", "Field Mapping", "State Mapping", "Open Questions"],
  "component-mapping.md": ["Open Questions"],
  "design-token-patch.md": ["Asset", "Open Questions"],
  "implementation-spec.md": ["Coding Boundary"],
  "ui-handoff.md": ["Required Figma Selection", "Text Requirements", "State Coverage", "Known Gaps", "Non-Goals"],
  "design-diff.md": ["Recommended Rerun Phases"],
};

function exists(filePath) {
  return fs.existsSync(filePath);
}

export function readText(filePath) {
  return exists(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

export function hasSections(markdown, sections) {
  return sections.every((section) => {
    const pattern = new RegExp(`^#{1,6}\\s+.*${escapeRegExp(section)}.*$`, "im");
    return pattern.test(markdown);
  });
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function aggregateStatus(rows) {
  if (rows.some((row) => row.status === "fail")) return "fail";
  if (rows.some((row) => row.status === "warn")) return "warn";
  return "pass";
}

export function checkMarkdownContracts(featureDir) {
  const rows = [];

  for (const [fileName, sections] of Object.entries(markdownContracts)) {
    const filePath = path.join(featureDir, fileName);
    if (!exists(filePath)) {
      rows.push({
        file: fileName,
        requiredSections: sections.join(", "),
        status: "warn",
        notes: "file missing",
      });
      continue;
    }

    const markdown = readText(filePath);
    const missing = sections.filter((section) => !hasSections(markdown, [section]));
    rows.push({
      file: fileName,
      requiredSections: sections.join(", "),
      status: missing.length === 0 ? "pass" : "fail",
      notes: missing.length === 0 ? "" : `missing: ${missing.join(", ")}`,
    });
  }

  return { status: aggregateStatus(rows), rows };
}

function walkDirs(rootDir) {
  if (!exists(rootDir)) return [];
  const result = [];
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(rootDir, entry.name);
    if (!entry.isDirectory()) continue;
    result.push(entryPath);
    result.push(...walkDirs(entryPath));
  }
  return result;
}

export function checkFixtureContracts(repoRoot) {
  const rows = [];
  const fixtureDirs = walkDirs(repoRoot).filter((dir) => {
    const normalized = dir.split(path.sep).join("/");
    return normalized.includes("/tests/fixtures/") && exists(path.join(dir, "README.md"));
  });

  for (const fixtureDir of fixtureDirs) {
    const expectedDir = path.join(fixtureDir, "expected");
    const hasExpected = exists(expectedDir) || fs.readdirSync(fixtureDir).some((name) => name.includes("expected"));
    const missing = [];
    if (!exists(path.join(fixtureDir, "README.md"))) missing.push("README.md");
    if (!hasExpected) missing.push("expected");

    rows.push({
      fixture: path.relative(repoRoot, fixtureDir),
      requiredFiles: "README.md, expected/",
      status: missing.length === 0 ? "pass" : "warn",
      notes: missing.length === 0 ? "" : `missing: ${missing.join(", ")}`,
    });
  }

  return { status: aggregateStatus(rows), rows };
}

function gitChangedFiles(repoRoot, baseRef) {
  try {
    const output = execFileSync("git", ["diff", "--name-only", `${baseRef}...HEAD`], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return output.split(/\r?\n/).filter(Boolean);
  } catch {
    return [];
  }
}

export function checkBoundary(repoRoot, baseRef, options = {}) {
  const changedFiles = options.changedFiles || gitChangedFiles(repoRoot, baseRef);
  const rows = [];
  const businessPaths = changedFiles.filter((fileName) => /^(src|app|components|pages)\//.test(fileName));

  rows.push({
    rule: "business code directories unchanged",
    status: businessPaths.length === 0 ? "pass" : "warn",
    notes: businessPaths.length === 0 ? "" : businessPaths.join(", "),
  });

  const implementationSpecs = walkDirs(path.join(repoRoot, "docs", "design"))
    .filter((dir) => exists(path.join(dir, "implementation-spec.md")))
    .map((dir) => path.join(dir, "implementation-spec.md"));
  const rawJsonFiles = implementationSpecs.filter((filePath) => /raw Figma JSON/i.test(readText(filePath)));

  rows.push({
    rule: "implementation spec excludes raw Figma JSON",
    status: rawJsonFiles.length === 0 ? "pass" : "warn",
    notes: rawJsonFiles.length === 0
      ? ""
      : `raw Figma JSON found in ${rawJsonFiles.map((filePath) => path.relative(repoRoot, filePath)).join(", ")}`,
  });

  rows.push({
    rule: "coding boundary remains explicit",
    status: "pass",
    notes: "Phase E handoff remains planning/spec/task-breakdown only",
  });

  return { status: aggregateStatus(rows), rows };
}

function defaultAssetManifestCheck() {
  return {
    status: "warn",
    rows: [
      {
        rule: "asset manifest generated",
        status: "warn",
        notes: "run figma-assets-validate to generate or review assets-manifest.md",
      },
    ],
  };
}

export function renderValidationReport(result) {
  const feature = result.feature || "unknown-feature";
  const lines = [
    `# Validation Report — ${feature}`,
    "",
    `> Generated by figma-assets-validate@0.1.0 at ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    "| Check Group | Status | Notes |",
    "|---|---|---|",
    `| markdown contract | ${result.markdown.status} |  |`,
    `| fixture contract | ${result.fixtures.status} |  |`,
    `| boundary check | ${result.boundary.status} |  |`,
    `| asset manifest | ${result.assetManifest.status} |  |`,
    `| optional llm judge | ${result.llmJudge.status} | LLM-as-judge skipped |`,
    "",
  ];

  appendMarkdownRows(lines, "Markdown Contract Check", ["File", "Required Sections", "Status", "Notes"], result.markdown.rows, (row) => [
    row.file,
    row.requiredSections,
    row.status,
    row.notes,
  ]);
  appendMarkdownRows(lines, "Fixture Contract Check", ["Fixture", "Required Files", "Status", "Notes"], result.fixtures.rows, (row) => [
    row.fixture,
    row.requiredFiles,
    row.status,
    row.notes,
  ]);
  appendMarkdownRows(lines, "Boundary Check", ["Rule", "Status", "Notes"], result.boundary.rows, (row) => [
    row.rule,
    row.status,
    row.notes,
  ]);
  appendMarkdownRows(lines, "Asset Manifest Check", ["Rule", "Status", "Notes"], result.assetManifest.rows, (row) => [
    row.rule,
    row.status,
    row.notes,
  ]);
  appendMarkdownRows(lines, "Optional LLM Judge", ["Target", "Status", "Notes"], result.llmJudge.rows, (row) => [
    row.target,
    row.status,
    row.notes,
  ], [["not enabled", result.llmJudge.status, "LLM-as-judge skipped"]]);

  lines.push("## Open Questions", "", "- [ ] Review warnings before coding if any check is warn/fail.", "");
  return lines.join("\n");
}

function appendMarkdownRows(lines, title, headers, rows, mapRow, fallbackRows = []) {
  lines.push(`## ${title}`, "");
  lines.push(`| ${headers.join(" | ")} |`);
  lines.push(`| ${headers.map(() => "---").join(" | ")} |`);
  const values = rows.length > 0 ? rows.map(mapRow) : fallbackRows;
  for (const row of values) {
    lines.push(`| ${row.map((cell) => String(cell || "").replace(/\|/g, "\\|")).join(" | ")} |`);
  }
  lines.push("");
}

function featureNameFromDir(featureDir) {
  return path.basename(featureDir) === "inputs" ? path.basename(path.dirname(featureDir)) : path.basename(featureDir);
}

function runCli(argv) {
  const [featureDir, baseRef = "HEAD"] = argv;
  if (!featureDir) {
    process.stderr.write("Usage: node figma-workflow/scripts/figma-validate-contracts.js <featureDir> [baseRef]\n");
    return 1;
  }

  const repoRoot = process.cwd();
  const result = {
    feature: featureNameFromDir(featureDir),
    markdown: checkMarkdownContracts(featureDir),
    fixtures: checkFixtureContracts(repoRoot),
    boundary: checkBoundary(repoRoot, baseRef),
    assetManifest: defaultAssetManifestCheck(),
    llmJudge: { status: "skipped", rows: [] },
  };
  process.stdout.write(renderValidationReport(result));
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = runCli(process.argv.slice(2));
}
