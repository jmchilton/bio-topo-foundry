import { z } from "zod";

import {
  artifactSpanSchema,
  claimCorpusDigest,
  claimClassifications,
  claimSeverities,
  corpusIdentitySchema,
  evidenceStates,
  type ClaimAdjudication,
  type CorpusIdentity,
} from "../base/claims";
import { toolClaimKinds } from "./extract";
import { evaluateClaim, toolVerdicts, type ToolFinding, type ToolVerdict } from "./evaluate";
import type { ExtractionDiagnostic, ToolClaim } from "./extract";
import type { PixiEvidence } from "./pixi";

/**
 * Assemble one run: every claim, its verdict, and what review has said about it.
 *
 * Evaluation and adjudication stay separate phases, as in the citation audit, so a human decision
 * can never rewrite the evidence that prompted it — the machine verdict is preserved beside the
 * reviewed one rather than replaced by it.
 */

export interface AdjudicatedFinding extends ToolFinding {
  /**
   * The verdict after review. Never a way to make a finding go away: only a
   * `checker-false-positive` moves it, and only to the verdict the reviewer asserted in its place.
   */
  effectiveVerdict: ToolVerdict;
  adjudication?: ClaimAdjudication["classification"];
  /**
   * A claim the extractor should never have produced. Withdrawn claims leave every rate rather
   * than passing: counting a misread sentence as a claim that holds would let the instrument
   * improve its own score by misreading more prose.
   */
  withdrawn: boolean;
}

export interface ToolAlignmentRun {
  schemaVersion: 2;
  generatedAt: string;
  corpus: CorpusIdentity;
  claims: ToolClaim[];
  findings: AdjudicatedFinding[];
  diagnostics: ExtractionDiagnostic[];
  summary: {
    /** Everything the extractor produced, before review. */
    extracted: number;
    /** Claims review struck as extractor defects. */
    withdrawn: number;
    /** The denominator: what remains a claim about this corpus after review. */
    assessed: number;
    byVerdict: Record<ToolVerdict, number>;
    /**
     * Recognized tokens the grammar refused to promote, and nothing else. This is not prose
     * coverage: a claim written in a shape the grammar does not know produces no token, so it is
     * counted nowhere and no number here can reveal it.
     */
    recognizedTokensDeclined: number;
    review: { required: number; completed: number };
  };
}

/**
 * The wire contract for `audit/tool-alignment.json`.
 *
 * A committed run is read back by the replay that gates the build, which makes it an input from
 * outside this process however it was produced. A type assertion would let a hand-edited or
 * half-written file describe itself as a passing audit, so the file is parsed, not asserted.
 */
export const toolAlignmentRunSchema = z
  .object({
    schemaVersion: z.literal(2),
    generatedAt: z.string().min(1),
    corpus: corpusIdentitySchema,
    claims: z.array(
      z
        .object({
          id: z.string().min(1),
          kind: z.enum(toolClaimKinds),
          environment: z.string().min(1),
          asserted: z.string().min(1),
          subject: z.string().min(1).optional(),
          span: artifactSpanSchema,
          context: z.string(),
        })
        .strict(),
    ),
    findings: z.array(
      z
        .object({
          claimId: z.string().min(1),
          verdict: z.enum(toolVerdicts),
          effectiveVerdict: z.enum(toolVerdicts),
          evidenceState: z.enum(evidenceStates),
          severity: z.enum(claimSeverities).optional(),
          observed: z.string().optional(),
          detail: z.string().optional(),
          adjudication: z.enum(claimClassifications).optional(),
          withdrawn: z.boolean(),
        })
        .strict(),
    ),
    diagnostics: z.array(
      z
        .object({
          artifactPath: z.string().min(1),
          line: z.number().int().positive(),
          reason: z.enum(["build-subject", "no-subject", "unknown-package", "hypothetical"]),
          text: z.string(),
        })
        .strict(),
    ),
    summary: z
      .object({
        extracted: z.number().int().nonnegative(),
        withdrawn: z.number().int().nonnegative(),
        assessed: z.number().int().nonnegative(),
        byVerdict: z.record(z.enum(toolVerdicts), z.number().int().nonnegative()),
        recognizedTokensDeclined: z.number().int().nonnegative(),
        review: z
          .object({
            required: z.number().int().nonnegative(),
            completed: z.number().int().nonnegative(),
          })
          .strict(),
      })
      .strict(),
  })
  .strict()
  // Referential integrity, in the direction that can silently lie: a finding naming no claim would
  // be a verdict about nothing, and the report renders it as a row with an unresolvable location.
  .refine(
    (run) => {
      const ids = new Set(run.claims.map(({ id }) => id));
      return run.findings.every(({ claimId }) => ids.has(claimId));
    },
    { message: "a finding names a claim the run does not carry", path: ["findings"] },
  )
  .refine((run) => run.summary.extracted === run.claims.length, {
    message: "summary.extracted disagrees with the claim count",
    path: ["summary", "extracted"],
  })
  .refine((run) => run.summary.assessed + run.summary.withdrawn === run.summary.extracted, {
    message: "assessed and withdrawn do not partition the extracted claims",
    path: ["summary", "assessed"],
  });

export interface BuildToolAlignmentRunOptions {
  adjudications: readonly ClaimAdjudication[];
  generatedAt: string;
  provenance?: { headRevision?: string; workingTreeDirty?: boolean };
}

/** A verdict that puts a claim in front of a person. */
const flagged = (verdict: ToolVerdict): boolean => verdict === "absent" || verdict === "wrong-value";

/**
 * What a reviewed decision does to a verdict.
 *
 * A `checker-false-positive` is the only one that changes an answer, and it must supply the answer
 * it changes it to — otherwise "the checker was wrong" would silently mean "the claim holds", which
 * is a different and much stronger statement than the reviewer made.
 */
function adjudicatedVerdict(adjudication: ClaimAdjudication, machine: ToolVerdict): ToolVerdict {
  if (adjudication.classification !== "checker-false-positive") return machine;
  const asserted = adjudication.assertedVerdict;
  if (asserted === undefined || !(toolVerdicts as readonly string[]).includes(asserted)) {
    throw new Error(
      `adjudication for ${adjudication.claimId} asserts verdict ${String(asserted)}, which is not one of ${toolVerdicts.join(", ")}`,
    );
  }
  return asserted as ToolVerdict;
}

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
      effectiveVerdict: applies ? adjudicatedVerdict(adjudication, finding.verdict) : finding.verdict,
      withdrawn: applies && adjudication.classification === "extractor-false-positive",
      ...(applies ? { adjudication: adjudication.classification } : {}),
    };
  });

  const assessed = findings.filter(({ withdrawn }) => !withdrawn);

  const byVerdict = Object.fromEntries(
    toolVerdicts.map((verdict) => [
      verdict,
      assessed.filter((finding) => finding.effectiveVerdict === verdict).length,
    ]),
  ) as Record<ToolVerdict, number>;

  const required = findings.filter(({ verdict }) => flagged(verdict)).length;

  return {
    schemaVersion: 2,
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
      extracted: claims.length,
      withdrawn: findings.length - assessed.length,
      assessed: assessed.length,
      byVerdict,
      recognizedTokensDeclined: diagnostics.length,
      review: {
        required,
        completed: findings.filter(
          ({ verdict, adjudication }) => flagged(verdict) && adjudication !== undefined,
        ).length,
      },
    },
  };
}
