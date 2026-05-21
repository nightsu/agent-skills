const assert = require("node:assert/strict");
const test = require("node:test");

const diff = require("./figma-diff.js");

const beforeMetadata = {
  file_key: "YclTRHKbwKZYdt8uY52fkw",
  node_id: "122924:5188",
  node: {
    id: "122924:5188",
    name: "后台 销售工作台",
    type: "FRAME",
    children: [
      {
        id: "card-call-out-rate",
        name: "外呼率",
        type: "FRAME",
        bounds: { x: 24, y: 120, width: 240, height: 96 },
        children: [
          { id: "text-call-out-rate-title", name: "外呼率", type: "TEXT", text: "外呼率" },
        ],
      },
    ],
  },
};

const afterMetadata = {
  file_key: "YclTRHKbwKZYdt8uY52fkw",
  node_id: "122924:5188",
  node: {
    id: "122924:5188",
    name: "后台 销售工作台",
    type: "FRAME",
    children: [
      {
        id: "card-call-out-rate",
        name: "首次外呼率",
        type: "FRAME",
        bounds: { x: 24, y: 120, width: 260, height: 96 },
        children: [
          { id: "text-call-out-rate-title", name: "首次外呼率", type: "TEXT", text: "首次外呼率" },
        ],
      },
      {
        id: "card-new-effective-call-rate",
        name: "有效通话率",
        type: "FRAME",
        bounds: { x: 300, y: 120, width: 240, height: 96 },
      },
    ],
  },
};

test("indexes recursive metadata nodes with parent and text fields", () => {
  const nodes = diff.indexNodes(beforeMetadata);

  assert.equal(nodes.get("122924:5188").parentId, null);
  assert.equal(nodes.get("card-call-out-rate").parentId, "122924:5188");
  assert.equal(nodes.get("text-call-out-rate-title").text, "外呼率");
});

test("detects added, changed, text, layout, and token changes", () => {
  const beforeContext = {
    tokens: {
      "card.background": "#FFFFFF",
      "card.radius": 8,
    },
  };
  const afterContext = {
    tokens: {
      "card.background": "#F8FAFF",
      "card.radius": 8,
    },
  };

  const nodeDiff = diff.diffNodes(beforeMetadata, afterMetadata);
  const textChanges = diff.diffText(beforeMetadata, afterMetadata);
  const layoutChanges = diff.diffLayout(beforeMetadata, afterMetadata);
  const tokenChanges = diff.diffTokens(beforeContext, afterContext);
  const recommendations = diff.recommendRerunPhases({
    ...nodeDiff,
    textChanges,
    layoutChanges,
    tokenChanges,
    assetChanges: [],
    unknownChanges: [],
  });

  assert.deepEqual(nodeDiff.addedNodes.map((node) => node.id), ["card-new-effective-call-rate"]);
  assert.equal(nodeDiff.changedNodes.find((node) => node.id === "card-call-out-rate").changeType, "node_changed");
  assert.deepEqual(textChanges[0], {
    node: "text-call-out-rate-title",
    before: "外呼率",
    after: "首次外呼率",
    recommendedAction: "Review Phase B and rerun Phase E",
  });
  assert.deepEqual(layoutChanges[0], {
    node: "card-call-out-rate",
    property: "width",
    before: 240,
    after: 260,
    recommendedAction: "Review Phase B and rerun Phase D/E",
  });
  assert.deepEqual(tokenChanges[0], {
    tokenType: "card.background",
    node: "design-context",
    before: "#FFFFFF",
    after: "#F8FAFF",
    recommendedAction: "Rerun Phase D and Phase E",
  });
  assert.deepEqual(
    recommendations.map((item) => item.phase),
    ["B", "C-low", "D", "E"],
  );
});
