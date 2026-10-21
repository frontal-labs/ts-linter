# Frontal TS Linter

![Frontal Banner](./banner.jpg)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=flat&logo=bun&logoColor=white)](https://bun.sh)

An opinionated TypeScript linting CLI built on top of **Biome**. It comes with
Zod for option validation, Commander for argument parsing, and a zero‑config
experience that auto‑detects a `biome.json` file or falls back to a minimal
configuration.

## Features

* **check** – Run Biome in read‑only mode.
* **fix** – Apply Biome fixes.
* **format** – Reformat files.
* **init** – Generate a minimal `biome.json` if one does not exist.
* **watch** – Watch mode with live feedback.
* **ci** – CI-optimized output with structured formats.
* **rulesets** – List available rulesets.

## Installation

```bash
# Locally in a project
bun add -D @frontal/ts-linter

# Or globally
bun add -g @frontal/ts-linter
```

## Usage

```bash
# Initialize configuration
ts-linter init --ruleset strict-typing

# Check for lint issues
ts-linter check

# Auto-fix issues
ts-linter fix

# Reformat code
ts-linter format

# List available rulesets
ts-linter rulesets
```

## Publishing

This project uses **Changesets** for version management and publishes to **GitHub Packages**.

### Prerequisites
Ensure you have a `GITHUB_TOKEN` with `packages:write` permission.

### Steps to Release
1. Run `bun run changeset` to create a new version entry.
2. Commit the changeset file.
3. The GitHub Action will automatically create a version PR or publish on merge to `main`.

### Manual Publish via CLI
If you need to publish manually:
```bash
# Authenticate with GH CLI
gh auth login --scopes write:packages

# Publish
bun run release
```

## License

MIT
