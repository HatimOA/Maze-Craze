
const express = require('express');

const app = express();
const stateRouter = require("./routes/Agents_behaviors"); 
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/Agents_behaviors", stateRouter);

app.use((req, res) => {
  res.json({ msg: "Not found" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});