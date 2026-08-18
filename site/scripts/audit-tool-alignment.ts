import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { writeJsonAtomic, writeTextAtomic } from "@galaxy-foundry/audit-base";
import { buildToolAlignmentRun } from "../src/lib/audit/tool-alignment/audit";
import { renderToolAlignmentMarkdown } from "../src/lib/audit/tool-alignment/report";
import {
  readReferentialAdjudications,
  REPO_ROOT,
  RUN_JSON_PATH,
  RUN_MARKDOWN_PATH,
  scanToolClaims,
} from "../src/lib/tool-alignment-audit";

/** Regenerate the committed tool-alignment run and report. Offline; reads only the worktree. */

const execFileAsync = promisify(execFile);

async function gitProvenance(): Promise<{ headRevision?: string; workingTreeDirty?: boolean }> {
  try {
    const { stdout: revision } = await execFileAsync("git", ["-C", REPO_ROOT, "rev-parse", "HEAD"]);
    const { stdout: status } = await execFileAsync("git", ["-C", REPO_ROOT, "status", "--porcelain"]);
    return { headRevision: revision.trim(), workingTreeDirty: status.trim() !== "" };
  } catch {
    return {};
  }
}

const scan = await scanToolClaims();
const run = buildToolAlignmentRun(scan.claims, scan.evidence, scan.diagnostics, {
  adjudications: await readReferentialAdjudications(scan.claims),
  generatedAt: new Date().toISOString(),
  provenance: await gitProvenance(),
});

await writeJsonAtomic(RUN_JSON_PATH, run);
await writeTextAtomic(RUN_MARKDOWN_PATH, renderToolAlignmentMarkdown(run));

const { byVerdict, assessed, withdrawn, recognizedTokensDeclined } = run.summary;
console.log(
  `tool-alignment: ${assessed} assessed — ${byVerdict.exists} hold, ${byVerdict["wrong-value"]} contradicted, ` +
    `${byVerdict.absent} absent, ${byVerdict.unpinned} unpinned, ${byVerdict.unavailable} unavailable ` +
    `(${withdrawn} withdrawn on review, ${recognizedTokensDeclined} recognized tokens declined)`,
);
