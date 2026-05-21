const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const cache = require("./figma-cache.js");

test("resolves cache paths with safe node id", () => {
  const paths = cache.getCachePaths(
    "docs/design/sales-workbench",
    "YclTRHKbwKZYdt8uY52fkw",
    "122924:5188",
  );

  assert.equal(paths.cacheDir, path.join("docs/design/sales-workbench", ".figma-cache"));
  assert.equal(paths.manifestPath, path.join("docs/design/sales-workbench", ".figma-cache", "manifest.json"));
  assert.equal(
    paths.metadataPath,
    path.join("docs/design/sales-workbench", ".figma-cache", "metadata.YclTRHKbwKZYdt8uY52fkw.122924-5188.json"),
  );
  assert.equal(
    paths.designContextPath,
    path.join("docs/design/sales-workbench", ".figma-cache", "design-context.YclTRHKbwKZYdt8uY52fkw.122924-5188.json"),
  );
  assert.equal(
    paths.screenshotMetaPath,
    path.join(
      "docs/design/sales-workbench",
      ".figma-cache",
      "screenshots",
      "screenshot.YclTRHKbwKZYdt8uY52fkw.122924-5188.json",
    ),
  );
});

test("writes manifest and summarizes fresh entries", () => {
  const featureDir = fs.mkdtempSync(path.join(os.tmpdir(), "figma-cache-test-"));

  cache.writeManifest(featureDir, {
    version: "0.1.0",
    feature: "sales-workbench",
    entries: [
      {
        file_key: "YclTRHKbwKZYdt8uY52fkw",
        node_id: "122924:5188",
        node_id_safe: "122924-5188",
        metadata_path: "metadata.YclTRHKbwKZYdt8uY52fkw.122924-5188.json",
        design_context_path: "design-context.YclTRHKbwKZYdt8uY52fkw.122924-5188.json",
        screenshot_meta_path: "screenshots/screenshot.YclTRHKbwKZYdt8uY52fkw.122924-5188.json",
        captured_by_phase: "C2",
        status: "fresh",
      },
    ],
  });

  const summary = cache.summarizeCache(featureDir);

  assert.match(summary, /Cache: .*\.figma-cache\/manifest\.json/);
  assert.match(summary, /Entries: 1/);
  assert.match(summary, /- YclTRHKbwKZYdt8uY52fkw 122924:5188 fresh C2/);
});
