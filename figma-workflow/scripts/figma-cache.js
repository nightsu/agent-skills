const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const VALID_STATUSES = new Set(["fresh", "stale", "invalid"]);

function toSafeNodeId(nodeId) {
  return String(nodeId).replace(/:/g, "-");
}

function getCacheDir(featureDir) {
  return path.join(featureDir, ".figma-cache");
}

function getCachePaths(featureDir, fileKey, nodeId) {
  const nodeIdSafe = toSafeNodeId(nodeId);
  const cacheDir = getCacheDir(featureDir);
  return {
    cacheDir,
    screenshotsDir: path.join(cacheDir, "screenshots"),
    manifestPath: path.join(cacheDir, "manifest.json"),
    metadataPath: path.join(cacheDir, `metadata.${fileKey}.${nodeIdSafe}.json`),
    designContextPath: path.join(cacheDir, `design-context.${fileKey}.${nodeIdSafe}.json`),
    screenshotMetaPath: path.join(cacheDir, "screenshots", `screenshot.${fileKey}.${nodeIdSafe}.json`),
  };
}

function readManifest(featureDir) {
  const manifestPath = path.join(getCacheDir(featureDir), "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
}

function writeManifest(featureDir, manifest) {
  const cacheDir = getCacheDir(featureDir);
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(path.join(cacheDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
}

function validateEntry(featureDir, entry) {
  const errors = [];

  for (const field of ["file_key", "node_id", "node_id_safe", "metadata_path", "design_context_path", "status"]) {
    if (!entry || !entry[field]) {
      errors.push(`missing ${field}`);
    }
  }

  if (entry && entry.node_id && entry.node_id_safe !== toSafeNodeId(entry.node_id)) {
    errors.push("node_id_safe does not match node_id");
  }

  if (entry && entry.status && !VALID_STATUSES.has(entry.status)) {
    errors.push(`unknown status ${entry.status}`);
  }

  for (const field of ["metadata_path", "design_context_path", "screenshot_meta_path"]) {
    if (entry && entry[field] && !fs.existsSync(path.join(getCacheDir(featureDir), entry[field]))) {
      errors.push(`missing file ${entry[field]}`);
    }
  }

  if (entry && entry.content_hash && !/^sha256:[a-f0-9]{64}$/.test(entry.content_hash)) {
    errors.push("content_hash must be sha256:<64 hex chars>");
  }

  return { valid: errors.length === 0, errors };
}

function summarizeCache(featureDir) {
  const manifestPath = path.join(getCacheDir(featureDir), "manifest.json");
  const lines = [`Cache: ${manifestPath}`];
  const manifest = readManifest(featureDir);

  if (!manifest) {
    lines.push("Entries: 0");
    lines.push("- manifest not created");
    return lines.join("\n");
  }

  const entries = Array.isArray(manifest.entries) ? manifest.entries : [];
  lines.push(`Entries: ${entries.length}`);

  for (const entry of entries) {
    lines.push(`- ${entry.file_key} ${entry.node_id} ${entry.status} ${entry.captured_by_phase || "unknown"}`);
  }

  return lines.join("\n");
}

function hashCacheEntry(parts) {
  const normalized = JSON.stringify(parts);
  return `sha256:${crypto.createHash("sha256").update(normalized).digest("hex")}`;
}

function printPaths(featureDir, fileKey, nodeId) {
  const paths = getCachePaths(featureDir, fileKey, nodeId);
  const relativeToCache = (value) => path.relative(paths.cacheDir, value);

  return [
    paths.cacheDir,
    relativeToCache(paths.metadataPath),
    relativeToCache(paths.designContextPath),
    relativeToCache(paths.screenshotMetaPath),
  ].join("\n");
}

function runCli(argv) {
  const [command, featureDir, fileKey, nodeId] = argv;

  if (command === "summary" && featureDir) {
    process.stdout.write(`${summarizeCache(featureDir)}\n`);
    return 0;
  }

  if (command === "paths" && featureDir && fileKey && nodeId) {
    process.stdout.write(`${printPaths(featureDir, fileKey, nodeId)}\n`);
    return 0;
  }

  process.stderr.write(
    [
      "Usage:",
      "  node figma-workflow/scripts/figma-cache.js summary <featureDir>",
      "  node figma-workflow/scripts/figma-cache.js paths <featureDir> <fileKey> <nodeId>",
    ].join("\n"),
  );
  process.stderr.write("\n");
  return 1;
}

module.exports = {
  getCacheDir,
  getCachePaths,
  hashCacheEntry,
  readManifest,
  summarizeCache,
  toSafeNodeId,
  validateEntry,
  writeManifest,
};

if (require.main === module) {
  process.exitCode = runCli(process.argv.slice(2));
}
