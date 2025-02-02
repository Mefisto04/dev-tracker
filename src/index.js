const FileTracker = require("./fileTracker");
const Reporter = require("./reporter");
const path = require("path");
function startTracking() {
  try {
    const projectPath = process.cwd();
    console.log(`Starting tracking in: ${projectPath}`);
    const tracker = new FileTracker(projectPath);
    tracker.initialize();

    process.on("SIGINT", () => {
      const report = Reporter.generateReport(tracker);
      Reporter.saveReport(report);
      Reporter.displayReport(report);
      process.exit();
    });
  } catch (error) {
    console.error("Failed to start tracking:", error);
    process.exit(1);
  }
}

module.exports = {
  startTracking,
};
