# Dev Tracker 🚀

[![npm version](https://img.shields.io/npm/v/dev-tracker)](https://www.npmjs.com/package/dev-tracker)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/Mefisto04/dev-tracker)](https://github.com/Mefisto04/dev-tracker/stargazers)

**Dev Tracker** is a developer productivity tool that monitors file changes in your project directory. It tracks additions, deletions, and modifications, providing detailed insights into your coding activity. Perfect for developers who want to analyze their workflow or keep track of changes in real-time.

---

## Features ✨

- **Real-Time File Monitoring**: Tracks file changes (additions, modifications, deletions) in your project.
- **Detailed Reports**: Generates a summary of file changes, including additions, deletions, and time spent.
- **Top Modified Files**: Highlights the most frequently modified files.
- **Dependency Tracking**: Lists all dependencies used in the project.
- **Language Statistics**: Shows the top 3 most used languages in your project.
- **Easy to Use**: Just run the command and start tracking!

---

## Installation 📦

To install **Dev Tracker** globally, run:

```bash
npm install -g dev-tracker
```

## Usage 🛠️

1. Navigate to your project directory:

   ```bash
   cd path/to/your/project
   ```

2. Start tracking:

   ```bash
   dev-tracker
   ```

3. Make changes to your files (create, modify, or delete files).

4. Press `Ctrl+C` to stop tracking and generate a report.

---

## Example Report 📊

When you stop the tracker, it will generate a report like this:

```
Project Summary
┌───────────────────────┬────────────────────────────────────────────┐
│ Metric                │ Value                                      │
├───────────────────────┼────────────────────────────────────────────┤
│ Total Time            │ 2 hours                                    │
│ Files Tracked         │ 15                                         │
│ Total Additions       │ +120                                       │
│ Total Deletions       │ -45                                        │
│ Top Languages         │ JavaScript (10 files), CSS (3 files), JSON │
└───────────────────────┴────────────────────────────────────────────┘

Top Modified Files
┌──────────────────────────────────────┬────────────┬────────────┬─────────┬─────────────────────┐
│ File                                 │ Additions  │ Deletions  │ Changes │ Last Modified       │
├──────────────────────────────────────┼────────────┼────────────┼─────────┼─────────────────────┤
│ src/index.js                         │ +25        │ -10        │ 5       │ 2023-10-15 14:30    │
│ src/reporter.js                      │ +15        │ -5         │ 3       │ 2023-10-15 14:25    │
└──────────────────────────────────────┴────────────┴────────────┴─────────┴─────────────────────┘

Project Dependencies
┌──────────────────────────────────────────────────────────────────────┐
│ Dependencies                                                         │
├──────────────────────────────────────────────────────────────────────┤
│ chalk                                                                │
│ chokidar                                                             │
│ cli-table3                                                           │
└──────────────────────────────────────────────────────────────────────┘
Total dependencies: 7
```

---

## Configuration ⚙️

By default, **Dev Tracker** ignores the following directories and files:

- `node_modules`
- `.git`
- `.devtracker` (internal snapshot directory)
- `package-lock.json`

To customize ignored paths, modify the `ignored` array in the `FileTracker` class.

---

## Contributing 🤝

Contributions are welcome! If you'd like to contribute to **Dev Tracker**, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request.

---

## License 📄

This project is licensed under the MIT License. See the [LICENSE](https://github.com/Mefisto04/dev-tracker/blob/main/LICENSE) file for details.

---

## Support 💬

If you encounter any issues or have questions, feel free to [open an issue](https://github.com/Mefisto04/dev-tracker/issues) on GitHub.

---

## Author 👨‍💻

Developed by [mefisto04](https://github.com/Mefisto04).

```

```
