# Project Architecture

`ts-linter` is designed as a modular wrapper around the Biome CLI, adding sophisticated configuration management and extended developer tooling.

## High-Level Architecture

The core logic resides in `scripts/main.ts`, which handles command orchestration, configuration merging, and execution.

### 1. Configuration Orchestration
The linter employs a "Layered Configuration" strategy. When a command is executed, `ts-linter`:
1.  **Loads Defaults**: Starts with a hardcoded `DEFAULT_CONFIG` rooted in the package.
2.  **Loads Project Config**: Searches for `biome.json` or `biome.jsonc` in the working directory.
3.  **Applies Overrides**: Loads `.frontal.json` for Frontal-specific opinionated overrides.
4.  **Injects Rulesets**: If a `--ruleset` is specified, it recursively merges rules from the ruleset directory (both bundled and local).
5.  **CLI Overrides**: Final overrides are applied from CLI flags (e.g., `--indent`).
6.  **Generated Temp Config**: Aggregates all layers into a temporary `.frontal-biome-temp.json`.
7.  **Executes Biome**: Calls the underlying `biome` binary pointing to the temporary config.

### 2. Validation Layer
Validation is enforced using **Zod**. This ensures that even when merging multiple configuration sources, the final output remains compatible with Biome's expectations.

- `BiomeConfigSchema`: Validates the full Biome configuration structure.
- `CLIOptionsSchema`: Validates user inputs from the command line.

### 3. Build & Distribution
The package is built using **Bun**.
- **Source**: `scripts/main.ts` is the entry point.
- **Bundler**: `Bun.build` bundles the source into a single, minified `dist/main.js`.
- **Target**: The build targets `node` to ensure compatibility across environments where the linter might be invoked.

## Directory Structure

```text
.
├── dist/                # Produced build artifacts
├── docs/                # Project documentation
├── references/          # Default configuration templates
├── rulesets/            # Bundled Biome rulesets (JSON/JSONC)
│   ├── core/
│   ├── react/
│   └── ...
├── scripts/
│   ├── main.ts          # Core logic & CLI entry point
│   └── build.ts         # Bun build script
├── tests/               # Integration & unit tests
└── tsconfig.json        # TypeScript configuration
```

## Internal Workflow

1.  **Parsing**: `commander` parses the CLI command and options.
2.  **Merging**: `deepMerge` utility handles the recursive combining of configuration objects.
3.  **Spawning**: `node:child_process` (specifically `spawnSync`) is used to invoke the Biome CLI.
4.  **Cleaning**: Temporary configuration files are unlinked after execution to keep the project directory clean.
