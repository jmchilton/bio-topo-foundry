import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  buildCitationAuditRun,
  collectEvidence,
  extractCitations,
  parseCitationAdjudications,
  parseCitationAuditRun,
  parseCitationEvidenceSnapshot,
  renderCitationAuditMarkdown,
  sourceTextDigest,
} from "@galaxy-foundry/audit-citations";
import type {
  CitationAuditRun,
  CitationScan,
} from "@galaxy-foundry/audit-citations";
import {
  loadCitationAuditConfig,
  loadConfiguredDocuments,
  referenceHeadingPattern,
} from "@galaxy-foundry/audit-citations/config";
import { z } from "zod";

/**
 * Bind the shared citation-audit mechanics to this Foundry's corpus and acceptance policy.
 *
 * The package deliberately owns no release policy: it reports verdicts and coverage and stops.
 * What counts as an acceptable corpus is declared here, and enforced by `citation-audit.test.ts`
 * through the same `pnpm validate` run that gates everything else.
 */
export const REPO_ROOT = "..";

export const auditPath = (relativePath: string) => path.join(REPO_ROOT, relativePath);

const CONFIG_PATH = auditPath("audit-citations.config.json");
const EVIDENCE_PATH = auditPath("audit/provider-evidence.json");
const ADJUDICATIONS_PATH = auditPath("audit/adjudications.json");
const UNCITED_ENTRIES_PATH = auditPath("audit/uncited-reference-entries.json");

export const RUN_JSON_PATH = auditPath("audit/citation-audit.json");
export const RUN_MARKDOWN_PATH = auditPath("audit/citation-audit.md");

/**
 * A reference section holds more than scholarly works. Software repositories, package
 * distributions, project documentation, and funding records are cited by URL because they have no
 * DOI to resolve, and the extractor is right to leave them alone.
 *
 * Coverage still has to mean something, so each such entry is enumerated once and bound to the
 * digest of its exact line. A new bibliography entry the extractor cannot read is therefore a
 * failure rather than a silent gap, while an entry moving down a file is a non-event.
 */
const uncitedReferenceEntriesSchema = z
  .object({
    schemaVersion: z.literal(1),
    entries: z
      .array(
        z
          .object({
            artifactPath: z.string().min(1),
            sourceDigest: z.string().regex(/^[a-f0-9]{64}$/u),
            note: z.string().min(1),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();

/** Mirrors the numbered-entry grammar the extractor treats as a bibliography line. */
const BIBLIOGRAPHY_ENTRY = /^\s*\d+\.\s+/u;

const readJson = async (pathname: string): Promise<unknown> =>
  JSON.parse(await readFile(pathname, "utf8")) as unknown;

export interface CitationAuditReplay {
  scan: CitationScan;
  run: CitationAuditRun;
  markdown: string;
  committedRun: CitationAuditRun;
  committedMarkdown: string;
}

/**
 * Rebuild the committed audit from committed evidence, without touching the network.
 *
 * `generatedAt` and Git provenance are replayed from the committed run rather than restamped:
 * they record when a run happened, and a comparison that treated them as content would fail on
 * every unrelated commit while hiding nothing.
 */
export async function replayCitationAudit(): Promise<CitationAuditReplay> {
  const config = await loadCitationAuditConfig(CONFIG_PATH);
  const headingPattern = referenceHeadingPattern(config);
  const scan = extractCitations(await loadConfiguredDocuments(REPO_ROOT, config), {
    ...(headingPattern ? { referenceHeadingPattern: headingPattern } : {}),
    scholarlyPageHosts: config.scholarlyPageHosts ?? [],
    ...(config.noteFrontmatter ? { noteFrontmatter: config.noteFrontmatter } : {}),
  });

  const snapshot = parseCitationEvidenceSnapshot(await readJson(EVIDENCE_PATH));
  const adjudications = parseCitationAdjudications(await readJson(ADJUDICATIONS_PATH));
  const collected = await collectEvidence(scan.candidates, snapshot, { refresh: false });

  const committedRun = parseCitationAuditRun(await readJson(RUN_JSON_PATH));
  const run = buildCitationAuditRun(scan, collected.snapshot, {
    adjudications,
    generatedAt: committedRun.generatedAt,
    provenance: {
      ...(committedRun.corpus.headRevision !== undefined
        ? { headRevision: committedRun.corpus.headRevision }
        : {}),
      ...(committedRun.corpus.workingTreeDirty !== undefined
        ? { workingTreeDirty: committedRun.corpus.workingTreeDirty }
        : {}),
    },
  });

  return {
    scan,
    run,
    markdown: renderCitationAuditMarkdown(run, collected.snapshot),
    committedRun,
    committedMarkdown: await readFile(RUN_MARKDOWN_PATH, "utf8"),
  };
}

export interface UnaccountedLine {
  artifactPath: string;
  line: number;
  text: string;
}

/**
 * Reference-section lines that produced no citation candidate and are not a reviewed exemption.
 *
 * Narrative lines are exempt by shape: the extractor only reads numbered entries, so a provenance
 * paragraph under a source-note heading was never a bibliography entry and enumerating each one
 * would make ordinary prose edits fail the build.
 */
export async function unaccountedReferenceLines(
  scan: CitationScan,
): Promise<UnaccountedLine[]> {
  const exempt = uncitedReferenceEntriesSchema.parse(await readJson(UNCITED_ENTRIES_PATH));
  const exemptDigests = new Set(
    exempt.entries.map(({ artifactPath, sourceDigest }) => `${artifactPath} ${sourceDigest}`),
  );

  const lineCache = new Map<string, string[]>();
  const linesOf = async (artifactPath: string): Promise<string[]> => {
    const cached = lineCache.get(artifactPath);
    if (cached) return cached;
    const lines = (await readFile(auditPath(artifactPath), "utf8")).split("\n");
    lineCache.set(artifactPath, lines);
    return lines;
  };

  const unaccounted: UnaccountedLine[] = [];
  for (const { artifactPath, line } of scan.diagnostics.unextractedReferenceLines) {
    const text = (await linesOf(artifactPath))[line - 1] ?? "";
    if (!BIBLIOGRAPHY_ENTRY.test(text)) continue;
    if (exemptDigests.has(`${artifactPath} ${sourceTextDigest(text)}`)) continue;
    unaccounted.push({ artifactPath, line, text });
  }
  return unaccounted;
}
