const fs = require("fs");
const path = require("path");
const moment = require("moment");
const Table = require("cli-table3");
const chalk = require("chalk");

class Reporter {
  static generateReport(tracker) {
    const productiveTimeMs = tracker.calculateProductiveTime();

    // Format time in sec/min/hr format
    let totalTimeFormatted;
    const seconds = Math.floor(productiveTimeMs / 1000);

    if (seconds < 60) {
      totalTimeFormatted = `${seconds} second${seconds !== 1 ? "s" : ""}`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSecs = seconds % 60;
      totalTimeFormatted = `${minutes} minute${
        minutes !== 1 ? "s" : ""
      } ${remainingSecs} second${remainingSecs !== 1 ? "s" : ""}`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSecs = seconds % 60;
      totalTimeFormatted = `${hours} hour${
        hours !== 1 ? "s" : ""
      } ${minutes} minute${minutes !== 1 ? "s" : ""} ${remainingSecs} second${
        remainingSecs !== 1 ? "s" : ""
      }`;
    }

    const report = {
      summary: {
        totalTime: totalTimeFormatted,
        startTime: moment(tracker.initTime).format("YYYY-MM-DD HH:mm:ss"),
        endTime: moment(tracker.lastActivityTime).format("YYYY-MM-DD HH:mm:ss"),
        totalFiles: tracker.fileStates.size,
        totalAdditions: Array.from(tracker.fileStates.values()).reduce(
          (sum, stats) => sum + stats.additions,
          0
        ),
        totalDeletions: Array.from(tracker.fileStates.values()).reduce(
          (sum, stats) => sum + stats.deletions,
          0
        ),
        topLanguages: tracker.getLanguageStats(),
        dependencies: tracker.getDependencies(),
      },
      fileDetails: tracker.getFileStats(),
    };

    return report;
  }

  static saveReport(report, outputPath = "./dev-report.json") {
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`Report saved to ${path.resolve(outputPath)}`);
  }
  static displayReport(report) {
    console.log("\n");
    this.displaySummaryTable(report.summary);
    this.displayFileTable(report.fileDetails);
    this.displayDependencies(report.summary.dependencies);
  }

  static displaySummaryTable(summary) {
    const table = new Table({
      head: [chalk.bold.cyan("Metric"), chalk.bold.cyan("Value")],
      colWidths: [25, 55],
    });

    table.push(
      [chalk.bold("Total Time"), chalk.green(summary.totalTime)],
      [chalk.bold("Start Time"), chalk.yellow(summary.startTime)],
      [chalk.bold("End Time"), chalk.yellow(summary.endTime)],
      [chalk.bold("Files Tracked"), summary.totalFiles],
      [
        chalk.bold("Total Additions"),
        chalk.green(`+${summary.totalAdditions}`),
      ],
      [chalk.bold("Total Deletions"), chalk.red(`-${summary.totalDeletions}`)],
      [
        chalk.bold("Top Languages"),
        summary.topLanguages
          .map(([lang, count]) => `${chalk.yellow(lang)} (${count} files)`)
          .join("\n"),
      ]
    );

    console.log(chalk.bold.underline("\nProject Summary"));
    console.log(table.toString());
  }

  static displayFileTable(fileDetails) {
    if (fileDetails.length === 0) return;

    const table = new Table({
      head: [
        chalk.bold.cyan("File"),
        chalk.bold.cyan("Additions"),
        chalk.bold.cyan("Deletions"),
        chalk.bold.cyan("Changes"),
        chalk.bold.cyan("Time Spent"),
        chalk.bold.cyan("Last Modified"),
      ],
      colWidths: [30, 10, 10, 10, 12, 18],
    });

    fileDetails
      .sort((a, b) => b.changes - a.changes)
      .slice(0, 10)
      .forEach((file) => {
        table.push([
          chalk.blue(file.file),
          chalk.green(`+${file.additions}`),
          chalk.red(`-${file.deletions}`),
          file.changes,
          chalk.yellow(file.timeSpent),
          moment(file.lastModified).format("YYYY-MM-DD HH:mm"),
        ]);
      });

    console.log(chalk.bold.underline("\nTop Modified Files"));
    console.log(table.toString());

    // Add a more detailed view of the top file
    if (fileDetails.length > 0) {
      const topFile = fileDetails.sort((a, b) => b.changes - a.changes)[0];

      console.log(
        chalk.bold.underline("\nDetailed Stats for Most Active File")
      );
      const detailTable = new Table({
        head: [chalk.bold.cyan("Metric"), chalk.bold.cyan("Value")],
        colWidths: [25, 55],
      });

      detailTable.push(
        [chalk.bold("File"), chalk.blue(topFile.file)],
        [chalk.bold("Total Changes"), topFile.changes],
        [chalk.bold("Additions"), chalk.green(`+${topFile.additions}`)],
        [chalk.bold("Deletions"), chalk.red(`-${topFile.deletions}`)],
        [chalk.bold("Time Spent"), chalk.yellow(topFile.timeSpent)],
        [chalk.bold("Total Edits"), topFile.totalEdits],
        [
          chalk.bold("Avg. Edit Size"),
          topFile.averageEditSize.toFixed(2) + " lines per edit",
        ],
        [
          chalk.bold("First Modified"),
          moment(topFile.firstModified).format("YYYY-MM-DD HH:mm:ss"),
        ],
        [
          chalk.bold("Last Modified"),
          moment(topFile.lastModified).format("YYYY-MM-DD HH:mm:ss"),
        ]
      );

      console.log(detailTable.toString());
    }
  }

  static displayDependencies(dependencies) {
    if (dependencies.length === 0) return;

    const table = new Table({
      head: [chalk.bold.cyan("Dependencies")],
      colWidths: [80],
      wordWrap: true,
    });

    dependencies.sort().forEach((dep) => {
      table.push([chalk.magenta(dep)]);
    });

    console.log(chalk.bold.underline("\nProject Dependencies"));
    console.log(table.toString());
    console.log(chalk.gray(`\nTotal dependencies: ${dependencies.length}`));
  }
}

module.exports = Reporter;
