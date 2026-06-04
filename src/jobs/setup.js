const fs = require("fs");
const path = require("path");

function createFolders() {
  const folders = [
    "datasets",
    "datasets/trajectories",
    "datasets/qtables",
    "datasets/trees",
    "models",
    "models/first_0",
    "models/second_0",
  ];

  folders.forEach(folder => {
    const fullPath = path.join(
      process.cwd(),
      folder
    );

    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, {
        recursive: true,
      });
    }
  });

  console.log("AI folders created");
}

module.exports = {
  createFolders,
};