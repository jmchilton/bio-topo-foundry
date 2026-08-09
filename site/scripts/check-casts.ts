#!/usr/bin/env vite-node

import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

import { castSweep, sweepReport } from "@galaxy-foundry/cast/command";

import { DEFAULT_CAST_TARGET, TDA_CAST_SPEC } from "../src/lib/cast-spec";

const repoRoot = path.resolve("..");
const bundles = path.join(repoRoot, "casts", DEFAULT_CAST_TARGET, "skills");
const molds = existsSync(bundles)
  ? readdirSync(bundles, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort()
  : [];
const check = !process.argv.slice(2).includes("--write");

const result = await castSweep(TDA_CAST_SPEC, {
  molds,
  target: DEFAULT_CAST_TARGET,
  root: repoRoot,
  check,
});
const verdict = sweepReport(result, {
  repoRoot,
  check,
  remediation: [
    "Drift is fixed by `pnpm casts` plus commit;",
    "an error is fixed in the Mold, reference, Kind, target, or hook that owns it.",
  ],
});

for (const line of verdict.err) console.error(line);
for (const line of verdict.out) console.log(line);
process.exitCode = verdict.exitCode;
