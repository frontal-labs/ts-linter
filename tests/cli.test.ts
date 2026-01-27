import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import { spawnSync } from "node:child_process";
import { writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";

const TEST_DIR = join(import.meta.dir, "tmp-test-project");

describe("ts-linter CLI", () => {
    beforeAll(() => {
        if (existsSync(TEST_DIR)) {
            rmSync(TEST_DIR, { recursive: true, force: true });
        }
        mkdirSync(TEST_DIR, { recursive: true });
    });

    afterAll(() => {
        // Keep it for debugging if needed, but normally we'd delete it
        if (existsSync(TEST_DIR)) {
            rmSync(TEST_DIR, { recursive: true, force: true });
        }
    });

    test("init command creates biome.json", () => {
        const result = spawnSync("bun", ["run", "../../scripts/main.ts", "init"], {
            cwd: TEST_DIR,
            encoding: "utf-8",
        });

        expect(result.status).toBe(0);
        expect(existsSync(join(TEST_DIR, "biome.json"))).toBe(true);
    }, 30000);

    test("check command detects issues", () => {
        writeFileSync(
            join(TEST_DIR, "issue.ts"),
            "const a: any = 1;\nvar b = 2;\n",
            "utf-8"
        );

        const result = spawnSync("bun", ["run", "../../scripts/main.ts", "check", "."], {
            cwd: TEST_DIR,
            encoding: "utf-8",
        });

        // Biome check should return non-zero if issues are found
        expect(result.status).not.toBe(0);
    }, 30000);

    test("rulesets command lists available rulesets", () => {
        const result = spawnSync("bun", ["run", "../../scripts/main.ts", "rulesets"], {
            cwd: TEST_DIR,
            encoding: "utf-8",
        });

        expect(result.status).toBe(0);
        expect(result.stdout).toContain("Available Rulesets");
        expect(result.stdout).toContain("strict-typing");
    }, 30000);

    test("format command works", () => {
        writeFileSync(
            join(TEST_DIR, "format.ts"),
            "const x=1 ;",
            "utf-8"
        );

        const result = spawnSync("bun", ["run", "../../scripts/main.ts", "format", "."], {
            cwd: TEST_DIR,
            encoding: "utf-8",
        });

        expect(result.status).toBe(0);
    }, 30000);
});
