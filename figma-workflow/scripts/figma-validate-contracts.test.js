import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  checkBoundary,
  checkFixtureContracts,
  checkMarkdownContracts,
  hasSections,
  renderValidationReport,
} from "./figma-validate-contracts.js";

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
