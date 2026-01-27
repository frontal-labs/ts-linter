#!/usr/bin/env node
/*
 * frontal-ts-linter
 * CLI wrapper around Biome, powered by Zod for option validation.
 *
 * Commands:
 *   check   – Run Biome in read‑only mode.
 *   fix     – Apply Biome fixes.
 *   format  – Reformat files.
 *   init    – Generate a minimal biome.json.
 */

import { Command } from "commander";
import { z } from "zod";
import { spawnSync } from "child_process";
import { existsSync, writeFileSync, readFileSync } from "fs";
import { join, resolve } from "path";
import * as os from "os";

const program = new Command();
program.name("frontal-ts-linter").description("Biome-powered TS linter CLI").version("0.1.0");

const runBiome = (args: string[], cwd: string = process.cwd()) => {
  const result = spawnSync("biome", args, { stdio: "inherit", cwd });
  if (result.status !== 0) process.exit(result.status ?? 1);
};

// Schema for CLI options if we want to extend later.
const OptionsSchema = z.object({});

program
  .command("check")
  .description("Lint files in current directory (read‑only)")
  .action(() => {
    runBiome(["check", "."]);
  });

program
  .command("fix")
  .description("Lint and auto‑fix files in current directory")
  .action(() => {
    runBiome(["fix", "."]);
  });

program
  .command("format")
  .description("Reformat files in current directory")
  .action(() => {
    runBiome(["format", "."]);
  });

program
  .command("init")
  .description("Create a minimal biome.json if none exists")
  .action(() => {
    const biomeConfigPath = join(process.cwd(), "biome.json");
    if (existsSync(biomeConfigPath)) {
      console.log("biome.json already exists. Skipping init.");
      process.exit(0);
    }
    const defaultConfig = readFileSync(
      resolve(__dirname, "../references/biome_defaults.json"),
      "utf8"
    );
    writeFileSync(biomeConfigPath, defaultConfig, "utf8");
    console.log("Created biome.json with default config.");
  });

program.parse(process.argv);

