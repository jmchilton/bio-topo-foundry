import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import { loadKindDocs } from "@galaxy-foundry/kind-schema/docs";

import { buildKindManifest } from "../src/lib/kind-manifest";
import { KINDS } from "../src/types";

const TYPES_DIR = "src/types";
const OUTPUT = path.join(TYPES_DIR, "kinds.generated.json");

function loadExamples(): Record<string, string> {
  return Object.fromEntries(
    KINDS.map(({ kind }) => {
      const examplePath = path.join(TYPES_DIR, kind, "example.md");
      if (!fs.existsSync(examplePath)) {
        throw new Error(`${kind}: missing ${examplePath}`);
      }
      return [kind, fs.readFileSync(examplePath, "utf8").trim()];
    }),
  );
}

const flags = process.argv.slice(2);
const unknown = flags.filter((flag) => flag !== "--check");
if (unknown.length > 0) {
  console.error("Usage: vite-node scripts/generate-kind-manifest.ts [--check]");
  process.exit(2);
}

let rendered: string;
try {
  const manifest = buildKindManifest({
    docs: loadKindDocs(KINDS, TYPES_DIR),
    examples: loadExamples(),
  });
  rendered = `${JSON.stringify(manifest, null, 2)}\n`;
} catch (error) {
  console.error((error as Error).message);
  process.exit(1);
}

if (flags.includes("--check")) {
  const current = fs.existsSync(OUTPUT) ? fs.readFileSync(OUTPUT, "utf8") : "";
  if (current !== rendered) {
    console.error(`${OUTPUT} is stale — run \`pnpm kinds\` and commit the result.`);
    process.exit(1);
  }
  console.log(`${OUTPUT} is up to date.`);
} else {
  fs.writeFileSync(OUTPUT, rendered);
  console.log(`Wrote ${OUTPUT}.`);
}
