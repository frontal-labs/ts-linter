#!/usr/bin/env node
/*
 * ts-linter
 * CLI wrapper around Biome, powered by Zod for option validation.
 *
 * Commands:
 *   check   – Run Biome in read-only mode.
 *   fix     – Apply Biome fixes.
 *   format  – Reformat files.
 *   init    – Generate a minimal biome.json.
 *   watch   – Watch mode with live linting feedback.
 *   ci      – CI-optimized linting with structured output.
 *   rulesets – List available rulesets.
 */

import { Command } from "commander";
import { z } from "zod";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { join, resolve, dirname, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import consola from "consola";
import pc from "picocolors";

// Get current script directory (ES module compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SUPPORTED_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".json", ".jsonc"];
const RULESETS_DIR = "rulesets";
const CONFIG_FILES = {
  biome: "biome.json",
  frontal: ".frontal.json",
} as const;

// ---------------------------------------------------------------------------
// Zod Schemas for strong typing (Updated for Biome 2.3.13)
// ---------------------------------------------------------------------------

/** Formatter configuration schema */
const FormatterConfigSchema = z.object({
  enabled: z.boolean().optional(),
  indentStyle: z.enum(["space", "tab"]).optional(),
  indentWidth: z.number().int().min(1).max(8).optional(),
  lineWidth: z.number().int().min(40).max(320).optional(),
  attributePosition: z.enum(["auto", "multiline"]).optional(),
  bracketSameLine: z.boolean().optional(),
  bracketSpacing: z.boolean().optional(),
});

/** Linter rule value schema */
const RuleValueSchema = z.union([
  z.literal("off"),
  z.literal("warn"),
  z.literal("error"),
  z.object({
    level: z.enum(["off", "warn", "error"]),
    options: z.record(z.string(), z.unknown()).optional(),
  }),
]);

/** Linter rules schema */
const LinterRulesSchema = z.object({
  recommended: z.boolean().optional(),
  all: z.boolean().optional(),
  correctness: z.record(z.string(), RuleValueSchema).optional(),
  suspicious: z.record(z.string(), RuleValueSchema).optional(),
  style: z.record(z.string(), RuleValueSchema).optional(),
  complexity: z.record(z.string(), RuleValueSchema).optional(),
  performance: z.record(z.string(), RuleValueSchema).optional(),
  security: z.record(z.string(), RuleValueSchema).optional(),
  a11y: z.record(z.string(), RuleValueSchema).optional(),
  nursery: z.record(z.string(), RuleValueSchema).optional(),
}).passthrough();

/** Linter configuration schema */
const LinterConfigSchema = z.object({
  enabled: z.boolean().optional(),
  rules: LinterRulesSchema.optional(),
  ignore: z.array(z.string()).optional(),
});

/** JavaScript configuration schema */
const JavaScriptConfigSchema = z.object({
  formatter: z.object({
    quoteStyle: z.enum(["single", "double"]).optional(),
    jsxQuoteStyle: z.enum(["single", "double"]).optional(),
    trailingCommas: z.enum(["all", "es5", "none"]).optional(),
    semicolons: z.enum(["always", "asNeeded"]).optional(),
    arrowParentheses: z.enum(["always", "asNeeded"]).optional(),
    bracketSameLine: z.boolean().optional(),
    quoteProperties: z.enum(["asNeeded", "preserve"]).optional(),
  }).optional(),
  globals: z.array(z.string()).optional(),
}).passthrough();

/** JSON configuration schema */
const JSONConfigSchema = z.object({
  formatter: z.object({
    trailingCommas: z.enum(["none", "all"]).optional(),
  }).optional(),
}).passthrough();

/** Full Biome configuration schema */
const BiomeConfigSchema = z.object({
  $schema: z.string().optional(),
  extends: z.array(z.string()).optional(),
  files: z.object({
    maxSize: z.number().optional(),
    ignore: z.array(z.string()).optional(),
    include: z.array(z.string()).optional(),
  }).optional(),
  formatter: FormatterConfigSchema.optional(),
  linter: LinterConfigSchema.optional(),
  javascript: JavaScriptConfigSchema.optional(),
  json: JSONConfigSchema.optional(),
  css: z.object({}).passthrough().optional(),
});

/** CLI options schema */
const CLIOptionsSchema = z.object({
  ruleset: z.string().optional(),
  indent: z.number().int().min(1).max(8).optional(),
  quote: z.enum(["single", "double"]).optional(),
  trailingComma: z.enum(["all", "es5", "none"]).optional(),
  ci: z.boolean().optional(),
  fix: z.boolean().optional(),
  verbose: z.boolean().optional(),
  quiet: z.boolean().optional(),
  config: z.string().optional(),
});

/** Load config options schema */
const LoadConfigOptionsSchema = z.object({
  ruleset: z.string().optional(),
  formatter: FormatterConfigSchema.optional(),
});

// Infer types from schemas
type FormatterConfig = z.infer<typeof FormatterConfigSchema>;
type BiomeConfig = z.infer<typeof BiomeConfigSchema>;
type CLIOptions = z.infer<typeof CLIOptionsSchema>;
type LoadConfigOptions = z.infer<typeof LoadConfigOptionsSchema>;

// ---------------------------------------------------------------------------
// Configuration loader
// ---------------------------------------------------------------------------

const DEFAULT_CONFIG: BiomeConfig = {
  $schema: "https://biomejs.dev/schemas/2.3.13/schema.json",
  formatter: {
    enabled: true,
    indentStyle: "space",
    indentWidth: 2,
    lineWidth: 100,
  },
  linter: {
    enabled: true,
    rules: {
      recommended: true,
    },
  },
  javascript: {
    formatter: {
      quoteStyle: "single",
      trailingCommas: "all",
      semicolons: "always",
      arrowParentheses: "always",
    },
  },
};

/** Deep merge two BiomeConfig objects – values from source override target */
function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const result = { ...target } as Record<string, unknown>;

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const targetValue = target[key];
      const sourceValue = source[key];

      if (
        targetValue !== null &&
        typeof targetValue === "object" &&
        !Array.isArray(targetValue) &&
        sourceValue !== null &&
        typeof sourceValue === "object" &&
        !Array.isArray(sourceValue)
      ) {
        result[key] = deepMerge(
          targetValue as Record<string, unknown>,
          sourceValue as Partial<Record<string, unknown>>
        );
      } else if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
        // Merge arrays by concatenation and deduplication
        result[key] = [...new Set([...targetValue, ...sourceValue])];
      } else {
        result[key] = sourceValue;
      }
    }
  }

  return result as T;
}

/** Safely parse JSON file and validate with schema */
function parseConfigFile(filePath: string): BiomeConfig | null {
  if (!existsSync(filePath)) {
    return null;
  }

  try {
    const data = readFileSync(filePath, "utf-8");
    // Remove comments for JSONC support
    const jsonWithoutComments = data.replace(/(^|[^\:])\/\/.*$/gm, "$1").replace(/\/\*[\s\S]*?\*\//g, "");
    const parsed = JSON.parse(jsonWithoutComments) as unknown;
    const result = BiomeConfigSchema.safeParse(parsed);

    if (result.success) {
      return result.data;
    }

    consola.warn(`Invalid config in ${pc.cyan(filePath)}: ${result.error.message}`);
    return null;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    consola.warn(`Could not parse ${pc.cyan(filePath)}: ${message}`);
    return null;
  }
}

/** Get available rulesets from the rulesets directory */
function getAvailableRulesets(cwd: string): string[] {
  const rulesets = new Set<string>();

  const scanDir = (dir: string) => {
    if (!existsSync(dir)) return;
    const items = readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      if (item.isDirectory()) {
        const subDir = join(dir, item.name);
        const subItems = readdirSync(subDir);
        for (const subItem of subItems) {
          if (subItem.endsWith(".json") || subItem.endsWith(".jsonc")) {
            rulesets.add(`${item.name}/${basename(subItem, extname(subItem))}`);
          }
        }
      } else if (item.name.endsWith(".json") || item.name.endsWith(".jsonc")) {
        rulesets.add(basename(item.name, extname(item.name)));
      }
    }
  };

  scanDir(resolve(__dirname, "..", RULESETS_DIR));
  scanDir(join(cwd, RULESETS_DIR));

  return Array.from(rulesets);
}

/** Load and merge configuration from files and CLI overrides */
function loadConfig(cwd: string, options: LoadConfigOptions = {}): BiomeConfig {
  let config: BiomeConfig = { ...DEFAULT_CONFIG };

  // Load biome.json or biome.jsonc
  const biomePath = join(cwd, CONFIG_FILES.biome);
  const biomeJsoncPath = join(cwd, "biome.jsonc");
  const biomeConfig = parseConfigFile(biomePath) ?? parseConfigFile(biomeJsoncPath);
  if (biomeConfig) {
    config = deepMerge(config, biomeConfig);
  }

  // Load .frontal.json
  const frontalPath = join(cwd, CONFIG_FILES.frontal);
  const frontalConfig = parseConfigFile(frontalPath);
  if (frontalConfig) {
    config = deepMerge(config, frontalConfig);
  }

  // Load ruleset if specified
  if (options.ruleset) {
    // Helper to find ruleset in various locations and formats
    const findRuleset = (name: string): BiomeConfig | null => {
      const locations = [
        join(cwd, RULESETS_DIR, name),
        join(cwd, RULESETS_DIR, `${name}.json`),
        join(cwd, RULESETS_DIR, `${name}.jsonc`),
        resolve(__dirname, "..", RULESETS_DIR, name),
        resolve(__dirname, "..", RULESETS_DIR, `${name}.json`),
        resolve(__dirname, "..", RULESETS_DIR, `${name}.jsonc`),
      ];

      for (const loc of locations) {
        const cfg = parseConfigFile(loc);
        if (cfg) return cfg;

        // If name has a slash, e.g. next/biome.jsonc
        if (name.includes("/")) {
          const [dir, file] = name.split("/");
          const nestedLocs = [
            join(cwd, RULESETS_DIR, dir!, `${file}.json`),
            join(cwd, RULESETS_DIR, dir!, `${file}.jsonc`),
            resolve(__dirname, "..", RULESETS_DIR, dir!, `${file}.json`),
            resolve(__dirname, "..", RULESETS_DIR, dir!, `${file}.jsonc`),
          ];
          for (const nLoc of nestedLocs) {
            const nCfg = parseConfigFile(nLoc!);
            if (nCfg) return nCfg;
          }
        }
      }
      return null;
    };

    const rulesetConfig = findRuleset(options.ruleset);
    if (rulesetConfig) {
      config = deepMerge(config, rulesetConfig);
      consola.info(`Loaded ruleset: ${pc.green(options.ruleset)}`);
    } else {
      consola.warn(`Ruleset not found: ${pc.yellow(options.ruleset)}`);
    }
  }

  // Apply formatter overrides
  if (options.formatter) {
    config.formatter = deepMerge(config.formatter ?? {}, options.formatter);
  }

  return config;
}

/** Write temporary config file for Biome */
function writeTempConfig(config: BiomeConfig, cwd: string): string {
  const tempPath = join(cwd, ".frontal-biome-temp.json");
  writeFileSync(tempPath, JSON.stringify(config, null, 2), "utf-8");
  return tempPath;
}

/** Clean up temporary config file */
function cleanupTempConfig(tempPath: string): void {
  if (existsSync(tempPath)) {
    try {
      const fs = require("node:fs");
      fs.unlinkSync(tempPath);
    } catch {
      // Ignore cleanup errors
    }
  }
}

// ---------------------------------------------------------------------------
// CLI Implementation
// ---------------------------------------------------------------------------

const program = new Command();
program
  .name("ts-linter")
  .description(pc.bold("Frontal TypeScript Linter") + " – Biome-powered opinionated linting")
  .version("0.1.0");

/** Biome execution result */
interface BiomeResult {
  success: boolean;
  exitCode: number;
  output?: string;
}

/** Run Biome CLI with given arguments */
function runBiome(
  args: string[],
  options: { cwd?: string; capture?: boolean } = {}
): BiomeResult {
  const cwd = options.cwd ?? process.cwd();

  if (options.capture) {
    const result = spawnSync("bunx", ["biome", ...args], { cwd, encoding: "utf-8" });
    return {
      success: result.status === 0,
      exitCode: result.status ?? 1,
      output: result.stdout + result.stderr,
    };
  }

  const result = spawnSync("bunx", ["biome", ...args], { stdio: "inherit", cwd });
  return {
    success: result.status === 0,
    exitCode: result.status ?? 1,
  };
}

/** Run Biome with merged config */
function runBiomeWithConfig(
  command: string,
  paths: string[],
  opts: CLIOptions,
  additionalArgs: string[] = []
): BiomeResult {
  const cwd = process.cwd();

  // Build formatter overrides from CLI options
  const formatterOverrides: FormatterConfig = {};
  if (opts.indent !== undefined) {
    formatterOverrides.indentWidth = opts.indent;
  }
  // Quote style and trailing comma are now JS-specific
  const jsOverrides: any = {};
  if (opts.quote) {
    jsOverrides.quoteStyle = opts.quote;
  }
  if (opts.trailingComma) {
    jsOverrides.trailingCommas = opts.trailingComma;
  }

  // Load merged configuration
  let config = loadConfig(cwd, {
    ruleset: opts.ruleset,
    formatter: Object.keys(formatterOverrides).length > 0 ? formatterOverrides : undefined,
  });

  if (Object.keys(jsOverrides).length > 0) {
    config.javascript = config.javascript || {};
    config.javascript.formatter = config.javascript.formatter || {};
    config.javascript.formatter = deepMerge(config.javascript.formatter, jsOverrides);
  }

  // Write temp config and run biome
  const tempConfigPath = writeTempConfig(config, cwd);

  try {
    const args = [command, "--config-path", tempConfigPath, ...additionalArgs, ...paths];

    if (opts.verbose) {
      consola.info(`Running: bunx biome ${args.join(" ")}`);
    }

    return runBiome(args, { cwd, capture: opts.ci });
  } finally {
    cleanupTempConfig(tempConfigPath);
  }
}

/** Validate and parse CLI options */
function validateCLIOptions(rawOpts: Record<string, unknown>): CLIOptions {
  const result = CLIOptionsSchema.safeParse(rawOpts);

  if (!result.success) {
    consola.error("Invalid CLI options:", result.error.format());
    process.exit(1);
  }

  return result.data;
}

/** Print a styled banner */
function printBanner(): void {
  console.log();
  console.log(pc.bold(pc.cyan("  Frontal TypeScript Linter")));
  console.log(pc.dim("  ─────────────────────────────"));
  console.log();
}

// ---------------------------------------------------------------------------
// Global Options
// ---------------------------------------------------------------------------

program
  .option("--ruleset <name>", "Name of preset ruleset to merge")
  .option("--indent <num>", "Number of spaces for indentation", (val) => parseInt(val, 10))
  .option("--quote <style>", "Quote style: single or double")
  .option("--trailing-comma <style>", "Trailing comma style: all|es5|none")
  .option("--verbose", "Show verbose output")
  .option("--quiet", "Suppress non-error output")
  .option("--config <path>", "Path to custom config file");

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

program
  .command("check")
  .description("Lint files in read-only mode (no fixes applied)")
  .argument("[paths...]", "Paths to check", ["."])
  .option("--ci", "CI mode with structured output")
  .action((paths: string[], cmdOpts: { ci?: boolean }) => {
    const rawOpts = { ...program.opts(), ...cmdOpts } as Record<string, unknown>;
    const opts = validateCLIOptions(rawOpts);

    if (!opts.quiet) {
      printBanner();
      consola.start("Checking files...");
    }

    const result = runBiomeWithConfig("check", paths, opts);

    if (result.success) {
      if (!opts.quiet) {
        consola.success(pc.green("All checks passed! ✓"));
      }
    } else {
      if (!opts.quiet) {
        consola.error(pc.red("Some checks failed"));
      }
      process.exit(result.exitCode);
    }
  });

program
  .command("fix")
  .description("Lint and auto-fix files")
  .argument("[paths...]", "Paths to fix", ["."])
  .option("--unsafe", "Apply unsafe fixes")
  .action((paths: string[], cmdOpts: { unsafe?: boolean }) => {
    const rawOpts = { ...program.opts(), fix: true } as Record<string, unknown>;
    const opts = validateCLIOptions(rawOpts);

    if (!opts.quiet) {
      printBanner();
      consola.start("Applying fixes...");
    }

    const additionalArgs = cmdOpts.unsafe ? ["--unsafe"] : [];
    const result = runBiomeWithConfig("check", paths, opts, ["--write", ...additionalArgs]);

    if (result.success) {
      if (!opts.quiet) {
        consola.success(pc.green("All fixes applied! ✓"));
      }
    } else {
      if (!opts.quiet) {
        consola.warn(pc.yellow("Some issues could not be auto-fixed"));
      }
      process.exit(result.exitCode);
    }
  });

program
  .command("format")
  .description("Format files")
  .argument("[paths...]", "Paths to format", ["."])
  .option("--check", "Check formatting without writing")
  .action((paths: string[], cmdOpts: { check?: boolean }) => {
    const rawOpts = program.opts() as Record<string, unknown>;
    const opts = validateCLIOptions(rawOpts);

    if (!opts.quiet) {
      printBanner();
      consola.start(cmdOpts.check ? "Checking format..." : "Formatting files...");
    }

    const additionalArgs = cmdOpts.check ? [] : ["--write"];
    const result = runBiomeWithConfig("format", paths, opts, additionalArgs);

    if (result.success) {
      if (!opts.quiet) {
        const msg = cmdOpts.check ? "All files properly formatted! ✓" : "Formatting complete! ✓";
        consola.success(pc.green(msg));
      }
    } else {
      process.exit(result.exitCode);
    }
  });

program
  .command("watch")
  .description("Watch files and lint on changes")
  .argument("[paths...]", "Paths to watch", ["."])
  .option("--fix", "Auto-fix issues on save")
  .action(async (paths: string[], cmdOpts: { fix?: boolean }) => {
    const rawOpts = { ...program.opts(), ...cmdOpts } as Record<string, unknown>;
    const opts = validateCLIOptions(rawOpts);

    printBanner();
    consola.info(`Watching for changes in: ${pc.cyan(paths.join(", "))}`);
    consola.info(`Press ${pc.bold("Ctrl+C")} to stop\n`);

    // Dynamic import for chokidar
    const { watch } = await import("chokidar");

    const watcher = watch(paths, {
      persistent: true,
      ignoreInitial: true,
      ignored: [
        "**/node_modules/**",
        "**/.git/**",
        "**/dist/**",
        "**/build/**",
        "**/.frontal-biome-temp.json",
      ],
    });

    const runLintOnFile = (filePath: string) => {
      const ext = extname(filePath);
      if (!SUPPORTED_EXTENSIONS.includes(ext)) {
        return;
      }

      console.log();
      consola.info(`File changed: ${pc.cyan(filePath)}`);

      const command = opts.fix ? "check" : "check";
      const additionalArgs = opts.fix ? ["--write"] : [];
      const result = runBiomeWithConfig(command, [filePath], { ...opts, quiet: true }, additionalArgs);

      if (result.success) {
        consola.success(pc.green(`✓ ${basename(filePath)}`));
      } else {
        consola.error(pc.red(`✗ ${basename(filePath)} has issues`));
      }
    };

    watcher
      .on("change", runLintOnFile)
      .on("add", runLintOnFile)
      .on("error", (error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        consola.error(`Watcher error: ${message}`);
      });

    // Handle graceful shutdown
    process.on("SIGINT", () => {
      console.log();
      consola.info("Stopping watcher...");
      watcher.close();
      process.exit(0);
    });
  });

program
  .command("init")
  .description("Initialize linter configuration")
  .option("--force", "Overwrite existing config")
  .option("--ruleset <name>", "Initialize with a specific ruleset")
  .action((cmdOpts: { force?: boolean; ruleset?: string }) => {
    printBanner();

    const cwd = process.cwd();
    const biomeConfigPath = join(cwd, CONFIG_FILES.biome);

    // Check for existing configs
    if (!cmdOpts.force) {
      if (existsSync(biomeConfigPath)) {
        consola.warn(`${pc.cyan(CONFIG_FILES.biome)} already exists. Use ${pc.bold("--force")} to overwrite.`);
        process.exit(0);
      }
    }

    // Generate config
    let config = { ...DEFAULT_CONFIG };

    if (cmdOpts.ruleset) {
      const rsPath = resolve(__dirname, "..", RULESETS_DIR, `${cmdOpts.ruleset}.json`);
      const rulesetConfig = parseConfigFile(rsPath);
      if (rulesetConfig) {
        config = deepMerge(config, rulesetConfig);
        consola.info(`Applied ruleset: ${pc.green(cmdOpts.ruleset)}`);
      }
    }

    // Write biome.json
    writeFileSync(biomeConfigPath, JSON.stringify(config, null, 2), "utf-8");
    consola.success(`Created ${pc.cyan(CONFIG_FILES.biome)}`);

    // Create rulesets directory if it doesn't exist
    const rulesetsPath = join(cwd, RULESETS_DIR);
    if (!existsSync(rulesetsPath)) {
      mkdirSync(rulesetsPath, { recursive: true });
      consola.info(`Created ${pc.cyan(RULESETS_DIR + "/")} directory`);
    }

    console.log();
    consola.box({
      title: "Next Steps",
      message: [
        `${pc.bold("1.")} Run ${pc.cyan("ts-linter check")} to lint your code`,
        `${pc.bold("2.")} Run ${pc.cyan("ts-linter fix")} to auto-fix issues`,
        `${pc.bold("3.")} Use ${pc.cyan("--ruleset <name>")} to apply preset rules`,
      ].join("\n"),
    });
  });

program
  .command("rulesets")
  .description("List available rulesets")
  .option("--json", "Output as JSON")
  .action((cmdOpts: { json?: boolean }) => {
    const cwd = process.cwd();
    const rulesets = getAvailableRulesets(cwd);

    if (cmdOpts.json) {
      console.log(JSON.stringify({ rulesets }, null, 2));
      return;
    }

    printBanner();
    console.log(pc.bold("Available Rulesets:\n"));

    if (rulesets.length === 0) {
      console.log(pc.yellow("No rulesets found. Create JSON files in the rulesets/ directory."));
      return;
    }

    for (const ruleset of rulesets) {
      console.log(`  ${pc.green("●")} ${ruleset}`);
    }

    console.log();
    consola.info(`Use with: ${pc.cyan("ts-linter check --ruleset <name>")}`);
  });

program
  .command("ci")
  .description("CI-optimized linting with exit codes")
  .argument("[paths...]", "Paths to check", ["."])
  .option("--format <type>", "Output format: text, json, github", "text")
  .action((paths: string[], cmdOpts: { format?: string }) => {
    const rawOpts = { ...program.opts(), ci: true, quiet: true } as Record<string, unknown>;
    const opts = validateCLIOptions(rawOpts);

    const result = runBiomeWithConfig("check", paths, opts, ["--reporter", cmdOpts.format ?? "text"]);

    if (result.output) {
      console.log(result.output);
    }

    process.exit(result.exitCode);
  });

program
  .command("migrate")
  .description("Migrate from ESLint/Prettier to Biome")
  .action(() => {
    printBanner();
    consola.start("Analyzing existing configuration...");

    const cwd = process.cwd();

    // Check for existing configs
    const eslintConfigs = [".eslintrc", ".eslintrc.js", ".eslintrc.json", ".eslintrc.yaml", "eslint.config.js"];
    const prettierConfigs = [".prettierrc", ".prettierrc.js", ".prettierrc.json", "prettier.config.js"];

    const foundEslint = eslintConfigs.some((f) => existsSync(join(cwd, f)));
    const foundPrettier = prettierConfigs.some((f) => existsSync(join(cwd, f)));

    if (foundEslint) {
      consola.info(`Found ${pc.yellow("ESLint")} configuration`);
    }
    if (foundPrettier) {
      consola.info(`Found ${pc.yellow("Prettier")} configuration`);
    }

    if (!foundEslint && !foundPrettier) {
      consola.info("No ESLint or Prettier config found. Running fresh init...");
    }

    // Run Biome's migrate command
    const result = runBiome(["migrate", "--write"], { cwd });

    if (result.success) {
      consola.success(pc.green("Migration complete!"));
      console.log();
      consola.info("You can now remove your ESLint and Prettier dependencies.");
    } else {
      consola.warn("Migration had some issues. Check the output above.");
    }
  });

// ---------------------------------------------------------------------------
// Parse and Execute
// ---------------------------------------------------------------------------

program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
