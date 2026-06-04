const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadDataset(filePath) {
  return cloudinary.uploader.upload(filePath, {
    resource_type: "raw",
    folder: "maze-craze/datasets",
  });
}

async function uploadQTable(filePath) {
  return cloudinary.uploader.upload(filePath, {
    resource_type: "raw",
    folder: "maze-craze/qtables",
  });
}

async function uploadTree(filePath) {
  return cloudinary.uploader.upload(filePath, {
    resource_type: "raw",
    folder: "maze-craze/trees",
  });
}

async function uploadModel(filePath) {
  return cloudinary.uploader.upload(filePath, {
    resource_type: "raw",
    folder: "maze-craze/models",
  });
}

module.exports = {
  cloudinary,
  uploadDataset,
  uploadQTable,
  uploadTree,
  uploadModel,
};