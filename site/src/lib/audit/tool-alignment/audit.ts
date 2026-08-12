import {
  claimCorpusDigest,
  type ClaimAdjudication,
  type CorpusIdentity,
} from "../base/claims";
import { evaluateClaim, type ToolFinding, type ToolVerdict } from "./evaluate";
import type { ExtractionDiagnostic, ToolClaim } from "./extract";
import type { PixiEvidence } from "./pixi";

/**
 * Assemble one run: every claim, its verdict, and what review has said about it.
 *
 * Evaluation and adjudication stay separate phases, as in the citation audit, so a human decision
 * can never rewrite the evidence that prompted it — the machine verdict is preserved beside the
 * reviewed one rather than replaced by it.
 */

export interface ToolAlignmentRun {
  schemaVersion: 1;
  generatedAt: string;
  corpus: CorpusIdentity;
  claims: ToolClaim[];
  findings: (ToolFinding & {
    effectiveVerdict: ToolVerdict;
    adjudication?: ClaimAdjudication["classification"];
  })[];
  diagnostics: ExtractionDiagnostic[];
  summary: {
    total: number;
    byVerdict: Record<ToolVerdict, number>;
    /** Claims extracted against tokens the extractor recognized but declined to promote. */
    coverage: { extracted: number; declined: number };
    review: { required: number; completed: number };
  };
}

export interface BuildToolAlignmentRunOptions {
  adjudications: readonly ClaimAdjudication[];
  generatedAt: string;
  provenance?: { headRevision?: string; workingTreeDirty?: boolean };
}

/** A verdict that puts a claim in front of a person. */
const flagged = (verdict: ToolVerdict): boolean => verdict === "absent" || verdict === "wrong-value";

export function buildToolAlignmentRun(
  claims: readonly ToolClaim[],
  evidenceByEnvironment: ReadonlyMap<string, PixiEvidence>,
  diagnostics: readonly ExtractionDiagnostic[],
  options: BuildToolAlignmentRunOptions,
): ToolAlignmentRun {
  const adjudicationByClaim = new Map(
    options.adjudications.map((adjudication) => [adjudication.claimId, adjudication]),
  );

  const findings = claims.map((claim) => {
    const evidence = evidenceByEnvironment.get(claim.environment);
    const finding: ToolFinding =
      evidence === undefined
        ? {
            claimId: claim.id,
            verdict: "unavailable",
            evidenceState: "unavailable",
            detail: `no pixi manifest was read for ${claim.environment}`,
          }
        : evaluateClaim(claim, evidence);

    const adjudication = adjudicationByClaim.get(claim.id);
    // An adjudication is bound to the text it reviewed. If that text has changed, the decision is
    // about a claim that no longer exists and is ignored rather than inherited.
    const applies = adjudication !== undefined && adjudication.sourceDigest === claim.span.sourceDigest;

    return {
      ...finding,
      effectiveVerdict:
        applies && adjudication.classification !== "confirmed-finding"
          ? ("exists" as ToolVerdict)
          : finding.verdict,
      ...(applies ? { adjudication: adjudication.classification } : {}),
    };
  });

  const byVerdict = Object.fromEntries(
    (["exists", "absent", "wrong-value", "unpinned", "unavailable"] as ToolVerdict[]).map((verdict) => [
      verdict,
      findings.filter((finding) => finding.effectiveVerdict === verdict).length,
    ]),
  ) as Record<ToolVerdict, number>;

  const required = findings.filter(({ verdict }) => flagged(verdict)).length;

  return {
    schemaVersion: 1,
    generatedAt: options.generatedAt,
    corpus: {
      digest: claimCorpusDigest(claims),
      claimCount: claims.length,
      ...(options.provenance?.headRevision === undefined
        ? {}
        : { headRevision: options.provenance.headRevision }),
      ...(options.provenance?.workingTreeDirty === undefined
        ? {}
        : { workingTreeDirty: options.provenance.workingTreeDirty }),
    },
    claims: [...claims],
    findings,
    diagnostics: [...diagnostics],
    summary: {
      total: claims.length,
      byVerdict,
      coverage: { extracted: claims.length, declined: diagnostics.length },
      review: {
        required,
        completed: findings.filter(
          ({ verdict, adjudication }) => flagged(verdict) && adjudication !== undefined,
        ).length,
      },
    },
  };
}
