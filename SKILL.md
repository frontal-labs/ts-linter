## Overview

The **frontal-ts-linter** skill bundles a fast, opinionated TypeScript linting
experience around the modern **Biome** engine. It offers:

* `check` – Run Biome in read‑only mode.
* `fix` – Apply Biome’s automatic code fixes.
* `format` – Reformat files with Biome’s style rules.
* `init` – Create a `biome.json` with the default config.

All commands work out‑of‑the‑box, automatically detecting an existing
`biome.json`. If none is found, a minimal opinionated config is generated.
The tool uses **Zod** to validate user‑provided options and guard against
runtime errors.

The skill is packaged as a standard Node/NPM package so it can be installed
globally with `npm i -g @frontal/ts-linter`.

## Usage

```bash
ts-linter check          # lint current directory
ts-linter fix            # lint and auto‑fix
ts-linter format         # format files
ts-linter init           # create biome.json with defaults
```

## Resources

### scripts/
`scripts/main.ts` – The CLI implementation using Commander and Zod.

### references/
`references/biome_defaults.json` – Default Biome config used by `init`.

---

**NOTE:** This skill is intended to be a minimal, production‑ready example.
Feel free to extend the config or add more CLI commands.

