const fs = require("fs");
const path = require("path");

const { generateDataset } = require("./dataset");

const {
  updateQTable,
  qTable,
} = require("./qlearning");

const {
  createNode,
  expandNode,
  backpropagate,
  saveTree,
} = require("./uct");

const {
  saveMetadata,
} = require("./metadata");

async function train(agentName = "first_0") {
  const dataset = await generateDataset();

  // =====================================
  // ROOT UCT NODE
  // =====================================
  const root = createNode({
    name: "root",
  });

  // =====================================
  // TRAINING LOOP
  // =====================================
  for (let i = 0; i < dataset.length - 1; i++) {
    const current = dataset[i];
    const next = dataset[i + 1];

    const state = {
      p1_x: current.p1_x,
      p1_y: current.p1_y,
      p2_x: current.p2_x,
      p2_y: current.p2_y,
      r_x: current.r_x,
      r_y: current.r_y,
      robbers_left: current.robbers_left,
    };

    const nextState = {
      p1_x: next.p1_x,
      p1_y: next.p1_y,
      p2_x: next.p2_x,
      p2_y: next.p2_y,
      r_x: next.r_x,
      r_y: next.r_y,
      robbers_left: next.robbers_left,
    };

    // ==========================
    // Q-LEARNING UPDATE
    // ==========================
    updateQTable(
      state,
      current.action,
      current.reward,
      nextState
    );

    // ==========================
    // UCT TREE UPDATE
    // ==========================
    const child = expandNode(
      root,
      current.action,
      nextState
    );

    backpropagate(
      child,
      current.reward
    );
  }

  // =====================================
  // SAVE Q-TABLE
  // =====================================
  const qTablePath = path.join(
    process.cwd(),
    "datasets",
    "qtables",
    `${agentName}_qtable.json`
  );

  fs.writeFileSync(
    qTablePath,
    JSON.stringify(qTable, null, 2)
  );

  // =====================================
  // SAVE UCT TREE
  // =====================================
  saveTree(
    root,
    agentName
  );

  // =====================================
  // SAVE MODEL METADATA
  // =====================================
  saveMetadata(
    agentName,
    dataset.length,
    "1.0"
  );

  return {
    success: true,
    agent: agentName,
    episodes: dataset.length,
    qTablePath,
    treePath: path.join(
      process.cwd(),
      "datasets",
      "trees",
      `${agentName}_tree.json`
    ),
    metadataPath: path.join(
      process.cwd(),
      "models",
      agentName,
      "metadata.json"
    ),
    qTable,
  };
}

module.exports = {
  train,
};