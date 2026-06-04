const fs = require("fs");
const path = require("path");

// ======================================
// UCT SCORE
// ======================================
function uctValue(
  totalVisits,
  nodeWins,
  nodeVisits,
  c = Math.sqrt(2)
) {
  if (nodeVisits === 0) {
    return Infinity;
  }

  return (
    nodeWins / nodeVisits +
    c *
      Math.sqrt(
        Math.log(totalVisits) / nodeVisits
      )
  );
}

// ======================================
// CREATE NODE
// ======================================
function createNode(
  state,
  action = null,
  parent = null
) {
  return {
    state,
    action,
    parent,
    visits: 0,
    reward: 0,
    children: [],
  };
}

// ======================================
// EXPAND NODE
// ======================================
function expandNode(
  parentNode,
  action,
  nextState
) {
  const child = createNode(
    nextState,
    action,
    parentNode
  );

  parentNode.children.push(child);

  return child;
}

// ======================================
// SELECT BEST CHILD USING UCT
// ======================================
function selectNode(nodes) {
  let best = null;
  let bestScore = -Infinity;

  const totalVisits = nodes.reduce(
    (sum, n) => sum + n.visits,
    0
  );

  for (const node of nodes) {
    const score = uctValue(
      totalVisits || 1,
      node.reward,
      node.visits
    );

    if (score > bestScore) {
      bestScore = score;
      best = node;
    }
  }

  return best;
}

// ======================================
// BACKPROPAGATE REWARD
// ======================================
function backpropagate(
  node,
  reward
) {
  let current = node;

  while (current) {
    current.visits += 1;
    current.reward += reward;

    current = current.parent;
  }
}

// ======================================
// SERIALIZE TREE
// ======================================
function serializeTree(node) {
  return {
    state: node.state,
    action: node.action,
    visits: node.visits,
    reward: node.reward,
    children: node.children.map(
      serializeTree
    ),
  };
}

// ======================================
// SAVE TREE
// ======================================
function saveTree(
  rootNode,
  agentName = "first_0"
) {
  const treePath = path.join(
    process.cwd(),
    "datasets",
    "trees",
    `${agentName}_tree.json`
  );

  const tree = serializeTree(rootNode);

  fs.writeFileSync(
    treePath,
    JSON.stringify(tree, null, 2)
  );

  return treePath;
}

// ======================================
// LOAD TREE
// ======================================
function loadTree(
  agentName = "first_0"
) {
  const treePath = path.join(
    process.cwd(),
    "datasets",
    "trees",
    `${agentName}_tree.json`
  );

  if (!fs.existsSync(treePath)) {
    return null;
  }

  return JSON.parse(
    fs.readFileSync(treePath, "utf8")
  );
}

module.exports = {
  uctValue,
  createNode,
  expandNode,
  selectNode,
  backpropagate,
  saveTree,
  loadTree,
};