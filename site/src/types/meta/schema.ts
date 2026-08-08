import { z } from "zod";

import { defineKind } from "../context";
import type { KindContext } from "../context";

/**
 * The two shelves a design record can sit on.
 *
 * A voice contract before it is a sort key: a `foundation` record argues, a `infrastructure`
 * record describes. A record whose voice fights its shelf is usually two records.
 */
export const RECORD_KINDS = ["foundation", "infrastructure"] as const;

/** The lifecycle a record moves through. Carried verbatim from the other instances. */
export const RECORD_STATUSES = [
  "draft",
  "reviewed",
  "revised",
  "stale",
  "archived",
] as const;

export const kind = defineKind({
  kind: "meta",
  title: "Design Record",
  layer: "substrate",
  summary:
    "A record of why the Foundry itself is built the way it is — the rationale behind the machinery, not the domain.",

  // Flat, like `package`, `paper`, `method`, and `replication_experiment`. A design record has
  // nothing to put beside it, so a directory per record would be a container with one file in it
  // forever.
  shape: "file",
  companions: [],

  build: (ctx: KindContext) =>
    z
      .object({
        type: z.literal("meta"),
        title: z.string().min(1),

        // 20–160, the bound every other titled kind here carries. This is the card text on the
        // design index, so it is written by hand either way; the bound is what checks it.
        summary: z.string().min(20).max(160),

        record_kind: z.enum(RECORD_KINDS),

        /**
         * Reading order *within a shelf*.
         *
         * Pedagogical rather than chronological — a reader wants the content model before the
         * build gates — so neither `created` nor the title sorts it right. Unique within a shelf
         * only: the two shelves number independently, so `order` never sorts them together.
         */
        order: z.number().int().min(1),

        /**
         * The lifecycle envelope, and the first dates in this corpus.
         *
         * Every other kind here declined dates rather than backfill values it could not recover.
         * These are declared because they *can* be populated truthfully: a design record is
         * written in this repository, so its own git history is the source.
         *
         * Declared on the kind rather than in `ctx.base` because this is the only kind that has
         * them. The other two instances make the same split for the same reason, though they
         * split it in different places — see `kind.md`.
         */
        status: z.enum(RECORD_STATUSES),
        created: z.coerce.date(),
        revised: z.coerce.date(),
        revision: z.number().int().min(1),

        ...ctx.base,
      })
      .strict(),

  /**
   * A revised record is one that has been revised.
   *
   * Without this the two halves of the lifecycle drift silently: `revision: 1` alongside
   * `status: revised` reads as a record with an editing history it does not have, and a `revised`
   * date earlier than `created` is a transposition no reader would catch. Both are the kind of
   * frontmatter error that stays true-looking forever.
   */
  refine: (frontmatter, refinement) => {
    if (frontmatter.revised < frontmatter.created) {
      refinement.addIssue({
        code: "custom",
        path: ["revised"],
        message: "a record cannot be revised before it was created",
      });
    }

    if (frontmatter.status === "revised" && frontmatter.revision < 2) {
      refinement.addIssue({
        code: "custom",
        path: ["status"],
        message: "`revised` claims an editing history, so `revision` must be at least 2",
      });
    }
  },
});
