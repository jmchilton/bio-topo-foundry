import {
  sourceNoteCoherence,
  sourceNoteFields,
} from "@galaxy-foundry/source-note";
import { z } from "zod";

import { defineKind } from "../context";
import type { KindContext } from "../context";

export { SUMMARY_POSTURES } from "@galaxy-foundry/source-note";

/**
 * The source-note contract, read against this instance's license table rather than the bundled one.
 *
 * `licenseId` is passed through so a bad id fails with this Foundry's wording, which the tag and
 * reference primitives in {@link KindContext} also do.
 */
const sourceNote = (ctx: KindContext) => ({
  licensePolicy: ctx.licensePolicy,
  licenseId: ctx.licenseId,
});

export const kind = defineKind({
  kind: "paper",
  title: "Paper",
  layer: "instance",
  summary:
    "A source note reviewing one external TDA or topological deep learning paper or survey, linking to the work rather than reproducing it.",
  shape: "file",
  companions: [],

  build: (ctx: KindContext) =>
    z
      .object({
        type: z.literal("paper"),
        title: z.string().min(1),
        summary: z.string().min(20).max(160),
        ...sourceNoteFields(sourceNote(ctx)),
        ...ctx.base,
      })
      .strict(),

  /**
   * Summary posture is determined by the source's license, not chosen by the author.
   *
   * A note may always fall back to own words; it may only claim to carry upstream expression when
   * the source's row permits it, and then only with the notice and license copy that row obliges.
   */
  refine: (frontmatter, refinement, ctx: KindContext) =>
    sourceNoteCoherence(sourceNote(ctx))(frontmatter, refinement),
});
