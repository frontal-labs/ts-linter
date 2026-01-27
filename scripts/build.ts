import { build } from "bun";
import { chmodSync } from "node:fs";
import consola from "consola";

consola.info("Building ts-linter...");

const result = await build({
    entrypoints: ["./scripts/main.ts"],
    outdir: "./dist",
    target: "node",
    minify: true,
    // We want to keep the entry point name as main.js
    naming: "[name].js",
});

if (!result.success) {
    consola.error("Build failed:");
    for (const message of result.logs) {
        consola.error(message);
    }
    process.exit(1);
}

// Ensure the output file is executable
try {
    chmodSync("./dist/main.js", 0o755);
} catch (err) {
    consola.warn("Could not set executable permissions on dist/main.js");
}

consola.log("Build complete: dist/main.js");
