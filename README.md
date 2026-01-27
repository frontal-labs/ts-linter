# @frontal/ts-linter

An opinionated TypeScript linting CLI built on top of **Biome**. It comes with
Zod for option validation, Commander for argument parsing, and a zero‑config
experience that auto‑detects a `biome.json` file or falls back to a minimal
configuration.

## Features

* **check** – Run Biome in read‑only mode.
* **fix** – Apply Biome fixes.
* **format** – Reformat files.
* **init** – Generate a minimal `biome.json` if one does not exist.

All commands work in the current working directory.

## Install

```bash
npm i -g @frontal/ts-linter
```

## Usage

```bash
frontal-ts-linter check
frontal-ts-linter fix
frontal-ts-linter format
frontal-ts-linter init
```

## License

MIT

