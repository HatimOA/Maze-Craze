const prisma = require("../lib/prisma");
const fs = require("fs");
const path = require("path");

async function generateDataset() {
  const rewards = await prisma.reward.findMany({
    include: {
      state: true,
      action: true,
    },
  });

  return rewards.map((r) => ({
    state_id: r.state_id,

    p1_x: r.state.p1_x,
    p1_y: r.state.p1_y,

    p2_x: r.state.p2_x,
    p2_y: r.state.p2_y,

    r_x: r.state.r_x,
    r_y: r.state.r_y,

    robbers_left: r.state.robbers_left,

    action: r.action.agents_behavior,

    reward: r.value,
  }));
}

async function saveDataset(filename = "trajectories_v1.json") {
  const dataset = await generateDataset();

  const folder = path.join(process.cwd(), "datasets");

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  const filePath = path.join(folder, filename);

  fs.writeFileSync(
    filePath,
    JSON.stringify(dataset, null, 2)
  );

  return filePath;
}

module.exports = {
  generateDataset,
  saveDataset,
};