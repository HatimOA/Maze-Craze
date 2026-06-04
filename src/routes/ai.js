const express = require("express");
const router = express.Router();

const fs = require("fs");
const path = require("path");

const { train } = require("../ai/trainer");
const { predict } = require("../ai/predictor");
const { saveDataset } = require("../ai/dataset");

const {
  uploadDataset,
} = require("../services/cloudinary");

router.post("/train", async (req, res) => {
  try {
    const qTable = await train();

    res.json({
      success: true,
      states: Object.keys(qTable).length,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

router.post("/predict", async (req, res) => {
  try {
    const prediction = predict(req.body);

    res.json(prediction);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

router.post("/dataset", async (req, res) => {
  try {
    const filePath = await saveDataset();

    res.json({
      success: true,
      file: filePath,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

router.post("/upload", async (req, res) => {
  try {
    const filePath = path.join(
      process.cwd(),
      "datasets",
      "trajectories_v1.json"
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: "Dataset not found",
      });
    }

    const result =
      await uploadDataset(filePath);

    res.json({
      success: true,
      url: result.secure_url,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});
router.get("/tree/:agent", async (req, res) => {
  try {
    const filePath = path.join(
      process.cwd(),
      "datasets",
      "trees",
      `${req.params.agent}_tree.json`
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: "Tree not found",
      });
    }

    const tree = JSON.parse(
      fs.readFileSync(filePath, "utf8")
    );

    res.json(tree);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});
module.exports = router;