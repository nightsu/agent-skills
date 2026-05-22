const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const {
  checkBoundary,
  checkFixtureContracts,
  checkMarkdownContracts,
  hasSections,
  renderValidationReport,
} = require("./figma-validate-contracts.js");

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

test("hasSections matches markdown headings by name", () => {
  const markdown = "# Spec\n\n## Coding Boundary\n\n## Open Questions\n";

  assert.equal(hasSections(markdown, ["Coding Boundary", "Open Questions"]), true);
  assert.equal(hasSections(markdown, ["Missing Section"]), false);
});

test("hasSections treats longer headings as matching contract keywords", () => {
  const markdown = "# Tokens\n\n## Asset References\n\n## Open Questions\n";

  assert.equal(hasSections(markdown, ["Asset", "Open Questions"]), true);
});

test("hasSections does not satisfy Scope with Out of Scope", () => {
  const markdown = [
    "# Requirement",
    "",
    "## Goal",
    "",
    "## Out of Scope",
    "",
    "## User States",
    "",
    "## Open Questions",
    "",
  ].join("\n");

  assert.equal(hasSections(markdown, ["Goal", "Scope", "User States", "Open Questions"]), false);
});

test("checkMarkdownContracts reports missing required sections", () => {
  const featureDir = fs.mkdtempSync(path.join(os.tmpdir(), "figma-contracts-"));
  write(path.join(featureDir, "implementation-spec.md"), "# Implementation Spec\n\n## Modules\n");
  write(path.join(featureDir, "ui-handoff.md"), "# UI Handoff\n\n## Required Figma Selection\n");

  const result = checkMarkdownContracts(featureDir);
  const implementation = result.rows.find((row) => row.file === "implementation-spec.md");
  const handoff = result.rows.find((row) => row.file === "ui-handoff.md");

  assert.equal(implementation.status, "fail");
  assert.match(implementation.notes, /Coding Boundary/);
  assert.equal(handoff.status, "fail");
  assert.match(handoff.notes, /Text Requirements/);
});

test("checkMarkdownContracts requires core phase A sections", () => {
  const featureDir = fs.mkdtempSync(path.join(os.tmpdir(), "figma-phase-a-contract-"));
  write(path.join(featureDir, "clarified-requirement.md"), "# Clarified Requirement\n\n## Open Questions\n");

  const result = checkMarkdownContracts(featureDir);
  const requirement = result.rows.find((row) => row.file === "clarified-requirement.md");

  assert.equal(requirement.status, "fail");
  assert.match(requirement.notes, /Goal/);
  assert.match(requirement.notes, /Scope/);
  assert.match(requirement.notes, /User States/);
});

test("fallback ui-understanding template satisfies required contract headings", () => {
  const templatePath = path.join(process.cwd(), "figma-workflow/templates/ui-understanding.md");
  const template = fs.readFileSync(templatePath, "utf8");

  assert.equal(hasSections(template, ["Page Structure", "Repeated Patterns", "Open Questions"]), true);
});

test("fixtures and skill templates do not use checkbox None as an open question", () => {
  const files = [
    "figma-design-token/SKILL.md",
    "figma-design-token/tests/fixtures/referral-home/expected/design-token-patch.md",
    "figma-emit-spec/tests/fixtures/referral-home/inputs/api-mapping.md",
    "figma-emit-spec/tests/fixtures/referral-home/inputs/design-token-patch.md",
  ];

  for (const file of files) {
    const content = fs.readFileSync(path.join(process.cwd(), file), "utf8");
    assert.doesNotMatch(content, /- \[ \]\s+None\b/, file);
    assert.doesNotMatch(content, /- \[ \]\s+.*没有则写 `None`/, file);
  }
});

test("checkFixtureContracts reports fixture directories missing expected files", () => {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), "figma-fixtures-"));
  write(path.join(repoRoot, "example-skill/SKILL.md"), "---\nname: example\n---\n");
  write(path.join(repoRoot, "example-skill/tests/fixtures/demo/README.md"), "# Demo\n");

  const result = checkFixtureContracts(repoRoot);
  const fixture = result.rows.find((row) => row.fixture.endsWith("example-skill/tests/fixtures/demo"));

  assert.equal(fixture.status, "warn");
  assert.match(fixture.notes, /expected/);
});

test("checkBoundary warns on business code diffs and raw Figma JSON", () => {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), "figma-boundary-"));
  write(path.join(repoRoot, "docs/design/sales-workbench/implementation-spec.md"), "raw Figma JSON\n");

  const result = checkBoundary(repoRoot, "base", {
    changedFiles: ["src/App.tsx", "figma-workflow/SKILL.md"],
  });

  assert.equal(result.status, "warn");
  assert.match(result.rows.map((row) => row.notes).join("\n"), /src\/App\.tsx/);
  assert.match(result.rows.map((row) => row.notes).join("\n"), /raw Figma JSON/);
});

test("renderValidationReport includes all report sections", () => {
  const report = renderValidationReport({
    feature: "sales-workbench",
    markdown: { status: "pass", rows: [] },
    fixtures: { status: "pass", rows: [] },
    boundary: { status: "pass", rows: [] },
    assetManifest: { status: "warn", rows: [{ rule: "blocking asset", status: "warn", notes: "missing destination" }] },
    llmJudge: { status: "skipped", rows: [] },
  });

  assert.match(report, /# Validation Report — sales-workbench/);
  assert.match(report, /## Markdown Contract Check/);
  assert.match(report, /## Fixture Contract Check/);
  assert.match(report, /## Boundary Check/);
  assert.match(report, /## Asset Manifest Check/);
  assert.match(report, /## Optional LLM Judge/);
});
