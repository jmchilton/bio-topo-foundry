import { describe, expect, it } from "vitest";

import {
  RUN_JSON_PATH,
  RUN_MARKDOWN_PATH,
  replayCitationAudit,
  unaccountedReferenceLines,
} from "../src/lib/citation-audit";

const replay = await replayCitationAudit();
const { run, scan } = replay;

const findingsWhere = (predicate: (verdict: string) => boolean) =>
  run.findings
    .filter((finding) => predicate(finding.effectiveVerdict))
    .map((finding) => {
      const candidate = run.candidates.find(({ id }) => id === finding.candidateId);
      const at = candidate
        ? `${candidate.span.artifactPath}:${candidate.span.startLine}`
        : finding.candidateId;
      return `${at} [${finding.effectiveVerdict}] ${finding.mismatches
        .map(({ detail }) => detail)
        .join("; ")}`;
    });

describe("citation integrity of the committed corpus", () => {
  it("audits a corpus that is not empty", () => {
    expect(scan.candidates.length).toBeGreaterThan(0);
    expect(run.summary.total).toBe(scan.candidates.length);
  });

  it("has evidence on disk for every citation it extracts", () => {
    // `unavailable` means the audit could not evaluate the citation at all. Committed evidence is
    // the only input offline, so this fails exactly when a citation was added without
    // `pnpm audit:citations:refresh` — the case where a silent pass would be worst.
    expect(findingsWhere((verdict) => verdict === "unavailable")).toEqual([]);
  });

  it("resolves every citation to the work its own text describes", () => {
    expect(
      findingsWhere((verdict) => verdict !== "resolved" && verdict !== "unavailable"),
    ).toEqual([]);
  });

  it("leaves no flagged finding unreviewed", () => {
    // `not-required` is the state of a corpus that flagged nothing, and is equally acceptable —
    // requiring `completed` would assert that defects must exist.
    expect(["completed", "not-required"]).toContain(run.manualReviewStatus);
    expect(run.manualReview.completed).toBe(run.manualReview.required);
  });

  it("accounts for every bibliography entry it could not read", async () => {
    // A resolution rate describes only the citations the extractor could read, so an entry written
    // in an unsupported shape must be reviewed rather than quietly dropped from the denominator.
    const unaccounted = await unaccountedReferenceLines(scan);
    expect(
      unaccounted.map(({ artifactPath, line, text }) => `${artifactPath}:${line} ${text.trim()}`),
      "add a reviewed entry to audit/uncited-reference-entries.json, or rewrite the citation in a supported form",
    ).toEqual([]);
  });

  it("keeps the committed report replayable from committed evidence", () => {
    expect(
      replay.markdown,
      `${RUN_MARKDOWN_PATH} is stale; run pnpm audit:citations`,
    ).toBe(replay.committedMarkdown);
    expect(replay.run, `${RUN_JSON_PATH} is stale; run pnpm audit:citations`).toEqual(
      replay.committedRun,
    );
  });
});
