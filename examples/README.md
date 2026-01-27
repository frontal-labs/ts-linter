# ts-linter Examples

This directory contains examples of how to integrate and use `ts-linter` in various project types.

## Available Examples

| Directory | Description |
|-----------|-------------|
| [`basic/`](./basic) | Minimum setup with default Biome recommended rules. |
| [`strict-typescript/`](./strict-typescript) | Using the `strict-typing` ruleset to enforce high type safety. |
| [`react-project/`](./react-project) | Using `react-style` for JSX best practices and accessibility (a11y). |

## How to Run

Since these examples are for demonstration, you need to have `ts-linter` installed and built.

1. **Build the linter** (from the root directory):
   ```bash
   bun run build
   ```

2. **Run an example**:
   Go into an example directory and run the linter via the build artifact:
   ```bash
   cd examples/strict-typescript
   bun run ../../dist/main.js check
   ```

   Or to test different rulesets:
   ```bash
   bun run ../../dist/main.js check --ruleset strict-typing
   ```
