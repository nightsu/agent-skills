const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const checkpoint = require("./figma-engineering-checkpoint.js");

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

test("infers required pre-handoff prompts from feature products", () => {
  const featureDir = fs.mkdtempSync(path.join(os.tmpdir(), "engineering-checkpoint-"));
  write(path.join(featureDir, "implementation-spec.md"), "# Implementation Spec\n");
  write(path.join(featureDir, "open-questions.md"), "# Open Questions\n- [ ] confirm metric copy\n");
  write(path.join(featureDir, ".figma-cache/snapshots/baseline/metadata.file.1-2.json"), "{}\n");
  write(path.join(featureDir, ".figma-cache/snapshots/current/metadata.file.1-2.json"), "{}\n");

  const state = checkpoint.inferEngineeringCheckpoint(featureDir, { checkpoint: "pre-handoff" });

  assert.equal(state.items.find((item) => item.skill === "figma-design-diff").status, "missing");
  assert.equal(state.items.find((item) => item.skill === "figma-design-diff").recommendation, "required_prompt");
  assert.equal(state.items.find((item) => item.skill === "figma-ui-handoff").recommendation, "recommended");
  assert.equal(state.items.find((item) => item.skill === "figma-assets-validate").recommendation, "required_prompt");
});

test("renders checkpoint and allows continue after required prompts are handled", () => {
  const state = {
    checkpoint: "pre-handoff",
    items: [
      {
        label: "Design diff",
        skill: "figma-design-diff",
        product: "design-diff.md",
        status: "generated",
        recommendation: "required_prompt",
        reason: "cache snapshots detected",
      },
      {
        label: "Assets / visual validation",
        skill: "figma-assets-validate",
        product: "assets-manifest.md, validation-report.md",
        status: "skipped",
        recommendation: "required_prompt",
        reason: "pre-handoff assets, visual baselines, and spec-snapshot checks are recommended before planning",
      },
    ],
  };

  assert.equal(checkpoint.canContinueToHandoff(state), true);
  const rendered = checkpoint.renderEngineeringCheckpoint(state);
  assert.match(rendered, /交接前工程化检查/);
  assert.doesNotMatch(rendered, /\bv4\b/i);
  assert.match(rendered, /figma-design-diff/);
  assert.match(rendered, /Assets \/ visual validation/);
  assert.match(rendered, /\[C\] Continue to handoff menu/);
});

test("requires every file in a combined product before marking it generated", () => {
  const featureDir = fs.mkdtempSync(path.join(os.tmpdir(), "engineering-combined-product-"));
  write(path.join(featureDir, "assets-manifest.md"), "# Assets\n");

  const state = checkpoint.inferEngineeringCheckpoint(featureDir, { checkpoint: "pre-handoff" });
  const assets = state.items.find((item) => item.skill === "figma-assets-validate");

  assert.equal(assets.status, "missing");
});

test("appends skip audit without changing products", () => {
  const featureDir = fs.mkdtempSync(path.join(os.tmpdir(), "engineering-skip-audit-"));
  const item = {
    skill: "figma-assets-validate",
    product: "assets-manifest.md, validation-report.md",
    recommendation: "required_prompt",
    reason: "pre-handoff assets, visual baselines, and spec-snapshot checks are recommended before planning",
    risk: "assets, visual baselines, and spec-snapshot consistency not reviewed before handoff",
  };

  checkpoint.appendSkipAudit(featureDir, {
    checkpoint: "pre-handoff",
    phaseContext: "after_phase_e_review",
    skipped: [item],
    continueField: "continue_to_handoff",
    now: "2026-05-21T12:00:00+08:00",
  });

  const audit = fs.readFileSync(path.join(featureDir, "inputs.md"), "utf8");
  assert.match(audit, /figma-workflow@v4-checkpoint/);
  assert.doesNotMatch(audit, /engineering-checkpoint/);
  assert.match(audit, /skill: figma-assets-validate/);
  assert.match(audit, /continue_to_handoff: true/);
  assert.equal(fs.existsSync(path.join(featureDir, "assets-manifest.md")), false);
});

test("treats audited skips as handled on later inference", () => {
  const featureDir = fs.mkdtempSync(path.join(os.tmpdir(), "engineering-skip-state-"));
  write(path.join(featureDir, ".figma-cache/snapshots/baseline/metadata.file.1-2.json"), "{}\n");
  write(path.join(featureDir, ".figma-cache/snapshots/current/metadata.file.1-2.json"), "{}\n");

  const firstState = checkpoint.inferEngineeringCheckpoint(featureDir, { checkpoint: "pre-handoff" });
  const skipped = firstState.items.filter((item) => item.recommendation === "required_prompt");

  checkpoint.appendSkipAudit(featureDir, {
    checkpoint: "pre-handoff",
    phaseContext: "after_phase_e_review",
    skipped,
    continueField: "continue_to_handoff",
    now: "2026-05-21T12:00:00+08:00",
  });

  const nextState = checkpoint.inferEngineeringCheckpoint(featureDir, { checkpoint: "pre-handoff" });

  assert.equal(nextState.items.find((item) => item.skill === "figma-design-diff").status, "skipped");
  assert.equal(nextState.items.find((item) => item.skill === "figma-assets-validate").status, "skipped");
  assert.equal(checkpoint.canContinueToHandoff(nextState), true);
});

test("recognizes legacy engineering-checkpoint skip audits", () => {
  const featureDir = fs.mkdtempSync(path.join(os.tmpdir(), "engineering-legacy-skip-"));
  write(path.join(featureDir, ".figma-cache/snapshots/baseline/metadata.file.1-2.json"), "{}\n");
  write(path.join(featureDir, ".figma-cache/snapshots/current/metadata.file.1-2.json"), "{}\n");
  write(path.join(featureDir, "inputs.md"), [
    "## 2026-05-21T12:00:00+08:00 — figma-workflow@engineering-checkpoint",
    "",
    "- checkpoint: pre-handoff",
    "- phase_context: after_phase_e_review",
    "- action: skip",
    "- skipped:",
    "  - skill: figma-design-diff",
    "    product: design-diff.md",
    "    recommendation: required_prompt",
    "    reason: cache snapshots detected",
    "    risk: design changes not reviewed before handoff",
    "",
  ].join("\n"));

  const state = checkpoint.inferEngineeringCheckpoint(featureDir, { checkpoint: "pre-handoff" });

  assert.equal(state.items.find((item) => item.skill === "figma-design-diff").status, "skipped");
});
