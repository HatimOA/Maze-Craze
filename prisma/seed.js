const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // -------------------------
  // 1. STATES (ONLY STATE DATA)
  // -------------------------
  const states = [
    {
      state_id: "state_0",
      p1_x: 0,
      p1_y: 0,
      p2_x: 0,
      p2_y: 0,
      r_x: 0,
      r_y: 0,
      robbers_left: 3,
    },
    {
      state_id: "state_1",
      p1_x: 1,
      p1_y: 0,
      p2_x: 0,
      p2_y: 0,
      r_x: 0,
      r_y: 0,
      robbers_left: 3,
    },
    {
      state_id: "state_2",
      p1_x: 0,
      p1_y: 1,
      p2_x: 0,
      p2_y: 0,
      r_x: 0,
      r_y: 0,
      robbers_left: 3,
    },
    {
      state_id: "state_3",
      p1_x: 1,
      p1_y: 1,
      p2_x: 0,
      p2_y: 0,
      r_x: 0,
      r_y: 0,
      robbers_left: 3,
    },
    {
      state_id: "state_4",
      p1_x: 2,
      p1_y: 1,
      p2_x: 0,
      p2_y: 0,
      r_x: 0,
      r_y: 0,
      robbers_left: 2,
    },
    {
      state_id: "state_5",
      p1_x: 2,
      p1_y: 2,
      p2_x: 0,
      p2_y: 0,
      r_x: 0,
      r_y: 0,
      robbers_left: 1,
    },
    {
      state_id: "state_6",
      p1_x: 3,
      p1_y: 2,
      p2_x: 0,
      p2_y: 0,
      r_x: 0,
      r_y: 0,
      robbers_left: 0,
    },
  ];

  for (const state of states) {
    await prisma.state.upsert({
      where: { state_id: state.state_id },
      update: {},
      create: state,
    });
  }

  // -------------------------
  // 2. ACTIONS
  // -------------------------
  const actions = [
    { action_id: 1, agents_behavior: "Move (up)" },
    { action_id: 2, agents_behavior: "Fire left" },
    { action_id: 3, agents_behavior: "Move (down right)" },
    { action_id: 4, agents_behavior: "Move (left)" },
    { action_id: 5, agents_behavior: "Fire right" },
    { action_id: 6, agents_behavior: "Fire" },
    { action_id: 7, agents_behavior: "No operation" },
  ];

  for (const action of actions) {
    await prisma.action.upsert({
      where: { action_id: action.action_id },
      update: {},
      create: action,
    });
  }

  // -------------------------
  // 3. REWARDS (STATE + ACTION LINK)
  // -------------------------
  const rewards = [
    { state_id: "state_0", action_id: 1, value: 0 },
    { state_id: "state_1", action_id: 2, value: 1 },
    { state_id: "state_2", action_id: 3, value: -1 },
    { state_id: "state_3", action_id: 4, value: 0 },
    { state_id: "state_4", action_id: 5, value: 1 },
    { state_id: "state_5", action_id: 6, value: 1 },
    { state_id: "state_6", action_id: 7, value: 0 },
  ];

  for (const reward of rewards) {
    await prisma.reward.create({
      data: reward,
    });
  }

  console.log("✅ Seed completed successfully");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });