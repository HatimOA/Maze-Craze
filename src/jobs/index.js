const cron = require("node-cron");

const { retrain } = require("./retrain");

cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Nightly AI retraining");

    await retrain();
  } catch (err) {
    console.error(err);
  }
});