const express = require("express");
const router = express.Router();

const state = require("../data/Agents_behaviors");

// GET (filter states)
router.get("/", (req, res) => {
  let result = state;

  Object.keys(req.query).forEach(key => {
    const value = req.query[key];

    result = result.filter(item => {
      const itemValue = item[key];

      if (itemValue === undefined) return false;

      if (!isNaN(itemValue)) {
        return itemValue === Number(value);
      }

      return itemValue
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase());
    });
  });

  if (result.length === 0) {
    return res.status(404).json({ msg: "Agent state is not found" });
  }

  res.json(result);
});

// POST (create new state agent WITH PROVIDED ID)
router.post("/Create/:state_id", (req, res) => {
  const id = Number(req.params.state_id);
  const { Action, Reward } = req.body;

  // Validate
  if (!Action || Reward === undefined) {
    return res.status(400).json({
      msg: "Action and Reward are required"
    });
  }

  // Check if ID already exists
  const exists = state.some(item => item.state_id === id);

  if (exists) {
    return res.status(400).json({
      msg: "State ID already exists"
    });
  }

  // Create new state object manually using ID from URL
  const newState = {
    state_id: id,
    Action,
    Reward
  };

  state.push(newState);

  res.status(201).json({
    msg: "Agent state created successfully",
    data: newState
  });
});

// PUT (update state by state_id)
router.put("/update/:state_id", (req, res) => {
  const id = Number(req.params.state_id);
  const { Action, Reward } = req.body;

  // Find the state
  const stateItem = state.find(item => item.state_id === id);

  if (!stateItem) {
    return res.status(404).json({
      msg: "Agent state not found"
    });
  }

  // Update only provided fields
  if (Action !== undefined) {
    stateItem.Action = Action;
  }

  if (Reward !== undefined) {
    stateItem.Reward = Reward;
  }

  res.json({
    msg: "Agent state updated successfully",
    data: stateItem
  });
});


// DELETE (remove state by state_id)

router.delete("/delete/:state_id", (req, res) => {
  const stateId = Number(req.params.state_id);

  // find index in array
  const stateIndex = state.findIndex(item => item.state_id === stateId);

  // if not found -> return 404
  if (stateIndex === -1) {
    return res.status(404).json({ msg: "State not found" });
  }

  // remove item
  const deletedState = state.splice(stateIndex, 1)[0];

  // respond with deleted item
  res.json({
    msg: "State deleted successfully",
    state: deletedState
  });
});

module.exports = router;