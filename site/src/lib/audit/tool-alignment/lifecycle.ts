import { adjudicationSchema, corpusIdentityFields, sha256, stableJson } from "@galaxy-foundry/audit-base";
import { z } from "zod";

import { toolVerdicts } from "./evaluate";

/**
 * The half of the audit lifecycle `@galaxy-foundry/audit-base` refuses to own.
 *
 * The package carries the span, the corpus record, the classifications, and the review shape,
 * because two independent checkers arrived at those separately. It carries no vocabulary: this
 * audit and the citation audit share exactly one verdict and one evidence state between them, and
 * a common union would be either a lowest common denominator or an untagged mixture. So the
 * vocabularies live here, and the shared schemas are built against them.
 */

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
 * The shared corpus record plus the count this audit reports rates over.
 *
 * The count is not shared: the citation audit's denominator is candidates and this one's is
 * claims, and `audit-base` exports the fields rather than a finished schema so that adding one
 * does not mean restating the rest.
 */
export const corpusIdentitySchema = z
  .object({ ...corpusIdentityFields, claimCount: z.number().int().nonnegative() })
  .strict();

export type CorpusIdentity = z.infer<typeof corpusIdentitySchema>;

/**
 * The shared review shape, bound to this checker's verdicts.
 *
 * Passing the vocabulary in buys something the local schema did not have: `assertedVerdict` was a
 * non-empty string, so a reviewer could record `resolved` — a citation verdict — against a runtime
 * claim and nothing would object.
 */
export const claimAdjudicationSchema = adjudicationSchema(toolVerdicts);

export type ClaimAdjudication = z.infer<typeof claimAdjudicationSchema>;

/**
 * Identifies an occurrence across unrelated line movement.
 *
 * Deliberately not shared. A citation candidate has no kind, so its id is minted from path, text
 * and occurrence alone; a claim needs `kind` in the identity because one sentence can produce a
 * channel claim and a version claim over the same span. The two ids carry different information,
 * and unifying them would be a guess rather than a convergence.
 */
export function claimId(parts: {
  artifactPath: string;
  kind: string;
  sourceText: string;
  ordinal: number;
}): string {
  return sha256(stableJson(parts)).slice(0, 16);
}

/**
 * Identifies the complete ordered claim set, so a run names the corpus it audited.
 *
 * Also not shared: the citation audit digests its full candidate records, and this digests the
 * ordered ids. Those answer different questions about what counts as the same corpus, and each id
 * here already covers the text it was minted from.
 */
export function claimCorpusDigest(claims: readonly { id: string }[]): string {
  return sha256(stableJson(claims.map(({ id }) => id)));
}
