require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const authRouter = require("./routes/auth");
const stateRouter = require("./routes/Agents_behaviors");
const errorHandler = require("./middleware/errorHandler"); // FIX PATH CASE

const app = express();

app.use(cors({ origin: "*" }));

// =========================
// BODY PARSER (test limit 5mb)
// =========================
app.use(express.json({ limit: "5mb" }));

// =========================
// JSON SYNTAX ERROR HANDLER
// =========================
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({ message: "Invalid JSON in request body" });
  }
  next(err);
});

// =========================
// ROUTES
// =========================
app.use("/api/auth", authRouter);
app.use("/api/Agents_behaviors", stateRouter);

// =========================
// STATIC FILES
// =========================
const publicPath = path.join(__dirname, "..", "public");
app.use(express.static(publicPath));

app.get("/", (req, res) => {
  const indexPath = path.join(publicPath, "index.html");

  if (!fs.existsSync(indexPath)) {
    return res.status(500).send("index.html missing");
  }

  res.sendFile(indexPath);
});

// =========================
// 404 HANDLER (MUST BE BEFORE ERROR HANDLER)
// =========================
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// =========================
// ERROR HANDLER (LAST)
// =========================
app.use(errorHandler);

module.exports = app;