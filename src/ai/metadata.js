const fs = require("fs");
const path = require("path");

function saveMetadata(
  agentName,
  episodes,
  version = "1.0"
) {
  const metadata = {
    agent: agentName,
    algorithm: "Q-Learning + UCT",
    episodes,
    version,
    createdAt: new Date().toISOString(),
  };

  const metadataPath = path.join(
    process.cwd(),
    "models",
    agentName,
    "metadata.json"
  );

  fs.writeFileSync(
    metadataPath,
    JSON.stringify(metadata, null, 2)
  );

  return metadataPath;
}

module.exports = {
  saveMetadata,
};