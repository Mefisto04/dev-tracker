const chokidar = require("chokidar");
const path = require("path");
const fs = require("fs");
const diff = require("diff");
const { parse } = require("@babel/parser");
const moment = require("moment");
const { globSync } = require("glob");

class FileTracker {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.fileStates = new Map();
    this.snapshotsDir = path.join(projectPath, ".devtracker");
    this.initTime = new Date();
    this.lastActivityTime = new Date();
    this.activityThreshold = 300000;

    if (!fs.existsSync(this.snapshotsDir)) {
      fs.mkdirSync(this.snapshotsDir);
    }
  }

  initialize() {
    this.watcher = chokidar.watch(this.projectPath, {
      ignored: [
        /node_modules/,
        /\.git/,
        this.snapshotsDir,
        /package-lock\.json/,
        /\.DS_Store/,
      ],
      persistent: true,
      ignoreInitial: false,
    });

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.watcher
      .on("add", (file) => this.handleFileAdd(file))
      .on("change", (file) => this.handleFileChange(file))
      .on("unlink", (file) => this.handleFileDelete(file))
      .on("error", (error) => console.error("Watcher error:", error));
  }

  async handleFileAdd(file) {
    const content = await fs.promises.readFile(file, "utf8");
    this.storeSnapshot(file, content);
    this.recordActivity();
  }

  async handleFileChange(file) {
    const newContent = await fs.promises.readFile(file, "utf8");
    const oldContent = this.getPreviousSnapshot(file);
    const changes = this.calculateChanges(oldContent, newContent);

    this.updateFileStats(file, changes);
    this.storeSnapshot(file, newContent);
    this.recordActivity();
  }

  handleFileDelete(file) {
    this.fileStates.delete(file);
    this.recordActivity();
  }

  calculateChanges(oldContent, newContent) {
    const differences = diff.diffLines(oldContent || "", newContent);
    return {
      added: differences.filter((d) => d.added).length,
      removed: differences.filter((d) => d.removed).length,
    };
  }

  storeSnapshot(file, content) {
    const snapshotFile = path.join(this.snapshotsDir, path.basename(file));
    fs.writeFileSync(snapshotFile, content);
  }

  getPreviousSnapshot(file) {
    try {
      const snapshotFile = path.join(this.snapshotsDir, path.basename(file));
      return fs.readFileSync(snapshotFile, "utf8");
    } catch (e) {
      return null;
    }
  }

  recordActivity() {
    this.lastActivityTime = new Date();
  }

  // updateFileStats(file, changes) {
  //   const stats = this.fileStates.get(file) || {
  //     additions: 0,
  //     deletions: 0,
  //     changes: 0,
  //   };

  //   stats.additions += changes.added;
  //   stats.deletions += changes.removed;
  //   stats.changes++;
  //   stats.lastModified = new Date();

  //   this.fileStates.set(file, stats);
  // }

  updateFileStats(file, changes) {
    const stats = this.fileStates.get(file) || {
      additions: 0,
      deletions: 0,
      changes: 0,
      firstModified: new Date(), // Track first modification
      lastModified: new Date(),
    };

    stats.additions += changes.added;
    stats.deletions += changes.removed;
    stats.changes++;
    stats.lastModified = new Date(); // Update last modification

    this.fileStates.set(file, stats);
  }

  getLanguageStats() {
    const exts = {};
    globSync("**/*", {
      cwd: this.projectPath,
      ignore: ["node_modules/**", ".git/**", this.snapshotsDir],
      nodir: true,
    }).forEach((file) => {
      const ext = path.extname(file).slice(1);
      if (ext) {
        exts[ext] = (exts[ext] || 0) + 1;
      }
    });

    return Object.entries(exts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }

  getDependencies() {
    const dependencies = new Set();
    const packageJson = path.join(this.projectPath, "package.json");

    try {
      const pkg = JSON.parse(fs.readFileSync(packageJson, "utf8"));
      Object.keys(pkg.dependencies || {}).forEach((dep) =>
        dependencies.add(dep)
      );
      Object.keys(pkg.devDependencies || {}).forEach((dep) =>
        dependencies.add(dep)
      );
    } catch (e) {}

    return Array.from(dependencies);
  }

  calculateProductiveTime() {
    const totalMs = this.lastActivityTime - this.initTime;
    const inactiveMs = Math.max(0, totalMs - this.activityThreshold);
    return totalMs - inactiveMs;
  }

  // getFileStats() {
  //   return Array.from(this.fileStates.entries()).map(([file, stats]) => ({
  //     file: path.relative(this.projectPath, file),
  //     ...stats,
  //     timeSpent: moment.duration(stats.lastModified - this.initTime).humanize(),
  //   }));
  // }

  getFileStats() {
    return Array.from(this.fileStates.entries()).map(([file, stats]) => ({
      file: path.relative(this.projectPath, file),
      ...stats,
      timeSpent: moment
        .duration(stats.lastModified - stats.firstModified)
        .humanize(),
      lastModified: stats.lastModified,
    }));
  }
}

module.exports = FileTracker;
