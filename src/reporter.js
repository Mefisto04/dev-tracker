const fs = require("fs");
const path = require("path");
const moment = require("moment");
const Table = require("cli-table3");
const chalk = require("chalk");

class Reporter {
  static generateReport(tracker) {
    const report = {
      summary: {
        totalTime: moment
          .duration(tracker.calculateProductiveTime())
          .humanize(),
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
        chalk.bold.cyan("Last Modified"),
      ],
      colWidths: [40, 12, 12, 12, 20],
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
          moment(file.lastModified).format("YYYY-MM-DD HH:mm"),
        ]);
      });

    console.log(chalk.bold.underline("\nTop Modified Files"));
    console.log(table.toString());
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
