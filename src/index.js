const FileTracker = require("./fileTracker");
const Reporter = require("./reporter");
const path = require("path");

function startTracking() {
  const projectPath = process.cwd();
  const tracker = new FileTracker(projectPath);

  tracker.initialize();

  process.on("SIGINT", () => {
    const report = Reporter.generateReport(tracker);
    Reporter.saveReport(report);
    Reporter.displayReport(report); // Add this line
    process.exit();
  });

  console.log("Tracking started... Press Ctrl+C to generate report");
}

module.exports = {
  startTracking,
};
