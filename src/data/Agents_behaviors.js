const state = [
  {
    state_id: 0,
    Action: "Move (up)",
    Reward: 0,
    keyword: "cooperate"
  },

  {
    state_id: 1,
    Action: "Fire left",
    Reward: 1,
    keyword: "cooperate"
  },

  {
    state_id: 2,
    Action: "Move (down right)",
    Reward: -1,
    keyword: "defect"
  },

  {
    state_id: 3,
    Action: "Move (left)",
    Reward: 0,
    keyword: "cooperate"
  },

  {
    state_id: 4,
    Action: "Fire right",
    Reward: 1,
    keyword: "cooperate"
  },

  {
    state_id: 5,
    Action: "Fire",
    Reward: 1,
    keyword: "cooperate"
  },

  {
    state_id: 6,
    Action: "No operation",
    Reward: 0,
    keyword: "defect"
  }
];

// Pagination + filtering function
function getPaginatedStates({ page = 1, limit = 2, keywords = [] }) {
  page = Math.max(1, parseInt(page));
  limit = Math.max(1, parseInt(limit));

  // 1. filter by keywords (optional)
  let filtered = state;

  if (keywords.length > 0) {
    filtered = state.filter((item) =>
      keywords.includes(item.keyword)
    );
  }

  // 2. pagination
  const start = (page - 1) * limit;
  const end = start + limit;

  const data = filtered.slice(start, end);

  return {
    page,
    limit,
    total: filtered.length,
    totalPages: Math.ceil(filtered.length / limit),
    data,
  };
}

module.exports = { state, getPaginatedStates };

