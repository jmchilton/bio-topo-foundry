import { z } from "zod";

import { defineKind } from "../context";
import type { KindContext } from "../context";

/**
 * The arc stages a study may run, in the order it runs them.
 *
 * Ordered rather than a bare set: `harden` before `replicate` is not a different plan, it is a
 * mistake, and the refinement below reads this array to say so.
 */
export const ARC_STAGES = ["replicate", "harden", "extend"] as const;

/** How a completed replicate stage came out. */
export const REPLICATION_OUTCOMES = [
  "reproduced",
  "partially_reproduced",
  "not_reproduced",
  "inconclusive",
] as const;

export const STUDY_STATUSES = [
  "planned",
  "running",
  "complete",
  "blocked",
  "superseded",
] as const;

/** What may be redistributed as one bundle, which is never just the code license. */
export const REDISTRIBUTION_POSTURES = [
  "open",
  "restricted",
  "mixed",
  "noassertion",
] as const;

/** A full commit id. Abbreviations collide and branch names move. */
const FULL_COMMIT_ID = /^[0-9a-f]{40}$/;

export const kind = defineKind({
  kind: "replication_experiment",
  title: "Replication experiment",
  layer: "instance",
  summary:
    "A bounded study this Foundry ran to test an external paper's claims, pinning the standalone repository that holds the evidence.",
  shape: "file",
  companions: [],

  build: (ctx: KindContext) =>
    z
      .object({
        type: z.literal("replication_experiment"),
        title: z.string().min(1),
        summary: z.string().min(20).max(160),

        /**
         * The executable experiment, pinned.
         *
         * A replication that cannot be re-run at the revision it reports is an anecdote, so the
         * repository is identified by a full commit id and never by a branch.
         */
        artifact: z
          .object({
            repository: z.url(),
            revision: z
              .string()
              .regex(FULL_COMMIT_ID, "must be a full 40-character commit id"),
            protocol: z.string().min(1).optional(),
            evidence_manifest: z.string().min(1).optional(),
          })
          .strict(),

        arc: z.array(z.enum(ARC_STAGES)).min(1),
        status: z.enum(STUDY_STATUSES),
        replication_outcome: z.enum(REPLICATION_OUTCOMES).optional(),

        /**
         * The biopixi fixture that re-ran the experiment here, absent until one has.
         *
         * Optional in the schema and required by `status: complete` below, because the honest
         * state of a study whose fixture does not exist yet is unfinished, not invalid.
         */
        environment: z.string().min(1).optional(),

        redistribution: z.enum(REDISTRIBUTION_POSTURES),
        ...ctx.base,
      })
      .strict(),

  refine: (frontmatter, refinement) => {
    /**
     * A study that never tried to reproduce anything is not a replication.
     *
     * Hardening or extending someone else's method without first testing its claims is worth
     * doing and is a different kind of note; the design draft reserves a broader `experiment`
     * kind for it rather than letting this one quietly widen.
     */
    if (!frontmatter.arc.includes("replicate")) {
      refinement.addIssue({
        code: "custom",
        path: ["arc"],
        message: "every replication experiment must include a `replicate` stage",
      });
    }

    const ordered = ARC_STAGES.filter((stage) =>
      frontmatter.arc.includes(stage),
    );
    if (
      frontmatter.arc.length !== ordered.length ||
      frontmatter.arc.some((stage, index) => stage !== ordered[index])
    ) {
      refinement.addIssue({
        code: "custom",
        path: ["arc"],
        message: `stages must be listed once each, in order: ${ARC_STAGES.join(" → ")}`,
      });
    }

    if (frontmatter.status !== "complete") return;

    /**
     * Completeness is a claim about evidence produced here, not about work finished elsewhere.
     *
     * The upstream repository can be finished and its findings written up while this Foundry has
     * never re-run it. Without this check the difference is invisible: the note reads as settled,
     * and the one thing that would make it so is the one thing missing.
     */
    if (!frontmatter.environment) {
      refinement.addIssue({
        code: "custom",
        path: ["environment"],
        message:
          "a complete replication experiment must name the environment that re-ran it here",
      });
    }

    if (!frontmatter.replication_outcome) {
      refinement.addIssue({
        code: "custom",
        path: ["replication_outcome"],
        message: "a complete replication experiment must record its outcome",
      });
    }
  },
});
