const fs = require("fs");
const path = require("path");

const { train } = require("../ai/trainer");
const { saveDataset } = require("../ai/dataset");

const {
  uploadDataset,
} = require("../services/cloudinary");

async function retrain() {
  console.log("Starting retraining...");

  const qTable = await train();

  const datasetPath =
    await saveDataset();

  const uploadResult =
    await uploadDataset(datasetPath);

  const qTablePath = path.join(
    process.cwd(),
    "datasets",
    "qtable_v1.json"
  );

  fs.writeFileSync(
    qTablePath,
    JSON.stringify(qTable, null, 2)
  );

  console.log("Training complete");

  return {
    states: Object.keys(qTable).length,
    datasetUrl:
      uploadResult.secure_url,
  };
}

module.exports = {
  retrain,
};