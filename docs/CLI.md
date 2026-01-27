# CLI Reference

The `ts-linter` provides a command-line interface to manage linting, formatting, and project configuration.

## Global Options

The following options can be applied to most commands:

| Option | Description |
|--------|-------------|
| `--ruleset <name>` | Specifies a preset ruleset to merge (e.g., `strict-typing`, `react-style`) |
| `--indent <num>` | Overrides the number of spaces for indentation (1-8) |
| `--quote <style>` | Overrides the quote style (`single` or `double`) |
| `--trailing-comma <style>` | Overrides the trailing comma style (`all`, `es5`, `none`) |
| `--verbose` | Enables verbose output for debugging |
| `--quiet` | Suppresses non-error output |
| `--config <path>` | Path to a custom configuration file |

---

## Commands

### `check [paths...]`
Lints files in read-only mode. No changes are made to the files.

- **Arguments**: Optional file or directory paths. Defaults to `.`.
- **Flags**:
  - `--ci`: Enables CI mode with structured output reporting.

### `fix [paths...]`
Lints files and automatically applies safe fixes.

- **Arguments**: Optional file or directory paths. Defaults to `.`.
- **Flags**:
  - `--unsafe`: Also apply unsafe fixes.

### `format [paths...]`
Reformats the code according to the configuration.

- **Arguments**: Optional file or directory paths. Defaults to `.`.
- **Flags**:
  - `--check`: Verifies formatting without writing changes.

### `watch [paths...]`
Watches the specified paths and runs the linter on every change.

- **Arguments**: Optional file or directory paths. Defaults to `.`.
- **Flags**:
  - `--fix`: Automatically applies fixes on every save.

### `init`
Initializes a new `biome.json` configuration file in the current directory.

- **Flags**:
  - `--force`: Overwrites an existing `biome.json`.
  - `--ruleset <name>`: Initializes with a specific ruleset pre-applied.

### `rulesets`
Lists all available rulesets bundled with the package or found locally.

- **Flags**:
  - `--json`: Outputs the list in JSON format.

### `ci [paths...]`
CI-optimized linting command.

- **Flags**:
  - `--format <type>`: Specifies output format (`text`, `json`, `github`).

### `migrate`
Utility to migrate existing ESLint and Prettier configurations to Biome.

---

## Exit Codes

- `0`: Success (no issues found).
- `1`: Failures found (linting errors or configuration issues).
