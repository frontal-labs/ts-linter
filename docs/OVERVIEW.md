# Overview

**Frontal TypeScript Linter** (`ts-linter`) is an opinionated, high-performance linting and formatting tool built on top of [Biome](https://biomejs.dev/). It simplifies maintaining code quality across large TypeScript projects by providing curated rulesets, a robust CLI, and a streamlined developer experience.

## Key Features

- **Blazing Fast performance**: Leverages Biome's Rust-based core for instantaneous linting and formatting.
- **Opinionated Rulesets**: Built-in presets for strict typing, React, performance, and security.
- **Watch Mode**: Real-time feedback with automatic linting on file changes.
- **Config Merging**: Intelligent merging of opinionated defaults with project-specific overrides via `.frontal.json`.
- **CI Ready**: Structured output modes (JSON, GitHub) for seamless integration into CI/CD pipelines.
- **Migration Path**: Built-in migration tools to transition from ESLint and Prettier.

## Quick Start

### Installation

```bash
# Using bun
bun add -D @frontal/ts-linter
```

### Initialization

```bash
bun run ts-linter init --ruleset strict-typing
```

### Basic Usage

```bash
# Check for issues
bun run ts-linter check

# Auto-fix issues
bun run ts-linter fix

# Reformat code
bun run ts-linter format
```

## Why ts-linter?

While Biome provides a powerful foundation, `ts-linter` adds a layer of standardization and ease of use:

1. **Preset Ecosystem**: Don't waste time configuring hundreds of rules; start with a vetted ruleset.
2. **Unified Configuration**: Merge global standards with project-specific needs effortlessly.
3. **Developer Tools**: Features like a CLI-native watch mode and easy migration utilities make transition and daily use a breeze.
