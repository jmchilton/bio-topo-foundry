import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { z } from "zod";

import {
  adjudicationProblems,
  claimAdjudicationSchema,
  type ClaimAdjudication,
} from "./audit/base/claims";
import {
  buildToolAlignmentRun,
  toolAlignmentRunSchema,
  type ToolAlignmentRun,
} from "./audit/tool-alignment/audit";
import { extractToolClaims, type ExtractionDiagnostic, type ToolClaim } from "./audit/tool-alignment/extract";
import { canonicalPackageName, readPixiEvidence, type PixiEvidence } from "./audit/tool-alignment/pixi";
import { renderToolAlignmentMarkdown } from "./audit/tool-alignment/report";

/**
 * Bind the tool-alignment checker to this Foundry's corpus and acceptance policy.
 *
 * The checker reports verdicts and coverage and stops, exactly as the citation audit does. What
 * counts as an acceptable corpus is declared here and enforced by `tool-alignment.test.ts` inside
 * the same `pnpm validate` run that gates everything else.
 */

export const REPO_ROOT = "..";
const auditPath = (relativePath: string) => path.join(REPO_ROOT, relativePath);

const ENVIRONMENTS_DIRECTORY = "content/environments";
const ADJUDICATIONS_PATH = auditPath("audit/tool-alignment-adjudications.json");

export const RUN_JSON_PATH = auditPath("audit/tool-alignment.json");
export const RUN_MARKDOWN_PATH = auditPath("audit/tool-alignment.md");

const adjudicationsSchema = z
  .object({
    schemaVersion: z.literal(1),
    adjudications: z.array(claimAdjudicationSchema),
  })
  .strict();

export interface ToolAlignmentScan {
  claims: ToolClaim[];
  diagnostics: ExtractionDiagnostic[];
  evidence: Map<string, PixiEvidence>;
}

/**
 * Read every fixture that has both a note and a manifest.
 *
 * A fixture with no note asserts nothing and is not a gap; a note with no manifest would be, and
 * cannot occur while the environment kind requires its companions.
 */
export async function scanToolClaims(): Promise<ToolAlignmentScan> {
  const base = auditPath(ENVIRONMENTS_DIRECTORY);
  const entries = (await readdir(base, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const claims: ToolClaim[] = [];
  const diagnostics: ExtractionDiagnostic[] = [];
  const evidence = new Map<string, PixiEvidence>();

  for (const environment of entries) {
    const directory = path.join(base, environment);
    const artifactPath = `${ENVIRONMENTS_DIRECTORY}/${environment}/index.md`;
    let note: string;
    try {
      note = await readFile(path.join(directory, "index.md"), "utf8");
    } catch {
      continue;
    }

    const pixi = await readPixiEvidence(directory, environment);
    evidence.set(environment, pixi);

    // The version extractor's pre-filter: a number is a version claim only when its subject is a
    // package this fixture actually declares or locked. Without it, portability grades, article
    // numbers, and C++ standards all read as versions.
    const knownPackages = new Set([
      ...(pixi.lockedPackages?.keys() ?? []),
      ...pixi.declaredDependencies.map(canonicalPackageName),
    ]);

    const scan = extractToolClaims(environment, artifactPath, note, knownPackages);
    claims.push(...scan.claims);
    diagnostics.push(...scan.diagnostics);
  }

  return { claims, diagnostics, evidence };
}

export async function readAdjudications(): Promise<ClaimAdjudication[]> {
  try {
    const parsed = adjudicationsSchema.parse(
      JSON.parse(await readFile(ADJUDICATIONS_PATH, "utf8")) as unknown,
    );
    return parsed.adjudications;
  } catch (error) {
    if ((error as { code?: string }).code === "ENOENT") return [];
    throw error;
  }
}

/**
 * Read the reviewed decisions and refuse the ones that quietly do nothing.
 *
 * A decision naming a claim id this corpus does not carry, or naming one twice, is not a decision
 * — it is a reviewer believing they cleared something. Retirement by digest is the designed path
 * and stays silent; these two are the failure the file must never have.
 */
export async function readReferentialAdjudications(
  claims: readonly ToolClaim[],
): Promise<ClaimAdjudication[]> {
  const adjudications = await readAdjudications();
  const broken = adjudicationProblems(claims, adjudications).filter(
    ({ kind }) => kind !== "retired",
  );
  if (broken.length > 0) {
    throw new Error(
      `${ADJUDICATIONS_PATH} carries decisions that apply to nothing:\n${broken
        .map(({ detail }) => `  - ${detail}`)
        .join("\n")}`,
    );
  }
  return adjudications;
}

export interface ToolAlignmentReplay {
  scan: ToolAlignmentScan;
  run: ToolAlignmentRun;
  markdown: string;
  committedRun: ToolAlignmentRun;
  committedMarkdown: string;
}

/**
 * Rebuild the committed audit from the committed corpus.
 *
 * `generatedAt` and Git provenance are replayed from the committed run rather than restamped:
 * they record when a run happened, and comparing them as content would fail on every unrelated
 * commit while hiding nothing.
 */
export async function replayToolAlignmentAudit(): Promise<ToolAlignmentReplay> {
  const scan = await scanToolClaims();
  const committedRun = toolAlignmentRunSchema.parse(
    JSON.parse(await readFile(RUN_JSON_PATH, "utf8")) as unknown,
  );
  const run = buildToolAlignmentRun(scan.claims, scan.evidence, scan.diagnostics, {
    adjudications: await readReferentialAdjudications(scan.claims),
    generatedAt: committedRun.generatedAt,
    provenance: {
      ...(committedRun.corpus.headRevision === undefined
        ? {}
        : { headRevision: committedRun.corpus.headRevision }),
      ...(committedRun.corpus.workingTreeDirty === undefined
        ? {}
        : { workingTreeDirty: committedRun.corpus.workingTreeDirty }),
    },
  });

  return {
    scan,
    run,
    markdown: renderToolAlignmentMarkdown(run),
    committedRun,
    committedMarkdown: await readFile(RUN_MARKDOWN_PATH, "utf8"),
  };
}
