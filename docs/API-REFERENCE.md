# API Reference

While `ts-linter` is primarily consumed via the CLI, it exposes several internal schemas and types that define how configurations are handled.

## Core Schemas (Zod)

### `BiomeConfigSchema`
The primary validator for the Biome configuration.

```typescript
const BiomeConfigSchema = z.object({
  $schema: z.string().optional(),
  extends: z.array(z.string()).optional(),
  files: FilesConfigSchema.optional(),
  formatter: FormatterConfigSchema.optional(),
  linter: LinterConfigSchema.optional(),
  javascript: JavaScriptConfigSchema.optional(),
  json: JSONConfigSchema.optional(),
  vcs: VCSConfigSchema.optional(),
});
```

### `FormatterConfigSchema`
Defines formatting standards at a global level.

- `indentStyle`: `'space'` | `'tab'`
- `indentWidth`: `number` (1-8)
- `lineWidth`: `number` (40-320)
- `attributePosition`: `'auto'` | `'multiline'`

### `LinterConfigSchema`
Configuration for linting rules and categories.

- `enabled`: `boolean`
- `rules`: `LinterRulesSchema`
- `ignore`: `string[]`

### `JavaScriptConfigSchema`
Specific overrides for JavaScript and TypeScript files.

- `formatter`:
  - `quoteStyle`: `'single'` | `'double'`
  - `trailingCommas`: `'all'` | `'es5'` | `'none'`
  - `semicolons`: `'always'` | `'asNeeded'`

---

## Internal Types

### `BiomeConfig`
Represented by `z.infer<typeof BiomeConfigSchema>`. This is the final object sent to the Biome engine.

### `CLIOptions`
Represented by `z.infer<typeof CLIOptionsSchema>`. These are the validated inputs from the Command Line.

---

## Key Functions (Internal)

### `loadConfig(cwd: string, options: LoadConfigOptions): BiomeConfig`
Handles the multi-layered merging logic. It returns a fully resolved configuration object.

### `deepMerge(target: T, source: Partial<T>): T`
A utility function that performs a recursive merge of two objects. Unlike standard shallow merges, this ensures that nested objects (like `rules`) are combined rather than overwritten.

### `getAvailableRulesets(cwd: string): string[]`
Scans the bundled and local `rulesets/` directories to find available preset files. It supports searching one level deep for categorized rules.
