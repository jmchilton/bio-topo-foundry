import { z } from "zod";

import { sha256, stableJson } from "./digest";

/**
 * The audit lifecycle shapes, with no checker's vocabulary in them.
 *
 * This mirrors `@galaxy-foundry/audit-citations` deliberately rather than incidentally. That
 * package is the first experimental audit; this is the second, and the substrate admission test
 * asks for two independent implementations before a shared `audit-base` can be extracted. Keeping
 * the converged half here — physically separated from anything that knows what pixi is — is what
 * makes that extraction a file move and an argument from evidence rather than a redesign.
 *
 * Divergences from the citation shapes are recorded in `audit/tool-alignment-README.md`; they are
 * the part of this experiment worth reading.
 */

/**
 * Where a claim lives, and proof the reviewed text has not changed since.
 *
 * A line number alone fails both ways: an unrelated insertion above invalidates a review that is
 * still correct, and an edit to the claim itself silently inherits the old decision.
 */
export const artifactSpanSchema = z
  .object({
    artifactPath: z.string().min(1),
    startLine: z.number().int().positive(),
    endLine: z.number().int().positive(),
    sourceDigest: z.string().regex(/^[a-f0-9]{64}$/u),
  })
  .strict();

export type ArtifactSpan = z.infer<typeof artifactSpanSchema>;

/**
 * Whether the check could be evaluated at all — kept in its own field, never folded into the
 * verdict.
 *
 * `unavailable` exists so that missing infrastructure is never reported as a failing claim. A
 * fixture with no committed lock has not been caught making a false statement; it has not been
 * checked.
 */
export const evidenceStates = ["observed", "absent", "unavailable"] as const;
export type EvidenceState = (typeof evidenceStates)[number];

/**
 * Severity separates identity disputes from ordinary drift, so that a claim contradicted by the
 * runtime does not sit in the same queue as one that merely reads oddly.
 */
export const claimSeverities = ["error", "warning"] as const;
export type ClaimSeverity = (typeof claimSeverities)[number];

export const corpusIdentitySchema = z
  .object({
    digest: z.string().regex(/^[a-f0-9]{64}$/u),
    claimCount: z.number().int().nonnegative(),
    headRevision: z.string().optional(),
    workingTreeDirty: z.boolean().optional(),
  })
  .strict();

export type CorpusIdentity = z.infer<typeof corpusIdentitySchema>;

/**
 * A reviewed decision about one finding, bound to the digest of the text it reviewed.
 *
 * The three classifications keep the machine verdict beside the human one rather than replacing
 * it: an extractor defect and a genuine repair are different facts about the audit, and collapsing
 * them would make the instrument unable to report its own precision.
 */
export const claimAdjudicationSchema = z
  .object({
    claimId: z.string().min(1),
    sourceDigest: z.string().regex(/^[a-f0-9]{64}$/u),
    classification: z.enum(["extractor-false-positive", "checker-false-positive", "confirmed-finding"]),
    note: z.string().min(1),
  })
  .strict();

export type ClaimAdjudication = z.infer<typeof claimAdjudicationSchema>;

export const sourceTextDigest = (sourceText: string): string => sha256(sourceText);

/** Identifies an occurrence across unrelated line movement, as the citation candidate id does. */
export function claimId(parts: {
  artifactPath: string;
  kind: string;
  sourceText: string;
  ordinal: number;
}): string {
  return sha256(stableJson(parts)).slice(0, 16);
}

/** Identifies the complete ordered claim set, so a run names the corpus it audited. */
export function claimCorpusDigest(claims: readonly { id: string }[]): string {
  return sha256(stableJson(claims.map(({ id }) => id)));
}
