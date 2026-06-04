const prisma = require("../lib/prisma");
const { qTable } = require("./qlearning");

function predict(state) {
  const key = JSON.stringify(state);

  const actions = qTable[key];

  if (!actions) {
    return {
      action: "UNKNOWN",
      confidence: 0,
    };
  }

  let bestAction = null;
  let bestValue = -Infinity;

  for (const [action, value] of Object.entries(
    actions
  )) {
    if (value > bestValue) {
      bestValue = value;
      bestAction = action;
    }
  }

  return {
    action: bestAction,
    confidence: bestValue,
  };
}

async function saveRecommendation(
  state_id,
  prediction
) {
  return prisma.recommendation.create({
    data: {
      state_id,
      recommended_action:
        prediction.action,
      confidence:
        Number(prediction.confidence),
      model_version: "first_0_v1",
    },
  });
}

module.exports = {
  predict,
  saveRecommendation,
};