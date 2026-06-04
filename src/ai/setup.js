const fs = require("fs");
const path = require("path");

function createFolder(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, {
      recursive: true,
    });
  }
}

function createFolders() {
  const folders = [
    path.join(process.cwd(), "datasets"),
    path.join(process.cwd(), "datasets", "trajectories"),
    path.join(process.cwd(), "datasets", "qtables"),
    path.join(process.cwd(), "datasets", "trees"),

    path.join(process.cwd(), "models"),
    path.join(process.cwd(), "models", "first_0"),
    path.join(process.cwd(), "models", "second_0"),
  ];

  folders.forEach(createFolder);

  console.log(
    "✅ AI folders initialized"
  );
}

module.exports = {
  createFolders,
};