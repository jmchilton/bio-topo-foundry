import { z } from "zod";

import { defineKind } from "../context";
import type { KindContext } from "../context";

/** The facet whose values a Method note may anchor. */
export const METHOD_FACET = "method";

export const kind = defineKind({
  kind: "method",
  title: "Method",
  layer: "instance",
  summary:
    "This Foundry's account of one TDA or topological deep learning technique: what it computes, when to reach for it, and what here implements it.",
  shape: "file",
  companions: [],

  build: (ctx: KindContext) =>
    z
      .object({
        type: z.literal("method"),
        title: z.string().min(1),
        summary: z.string().min(20).max(160),
        /**
         * The `method/` facet value this note is the landing note for.
         *
         * A Method note is not merely tagged with a technique, it *is* the corpus's page about
         * that technique, so the relationship is a declared field rather than a slug convention.
         * Refinement below holds the two ends together.
         */
        facet_tag: z
          .string()
          .refine((value) => ctx.tags.facetOf(value) === METHOD_FACET, {
            message: `must be a value of the \`${METHOD_FACET}\` facet in meta_tags.yml`,
          }),
        ...ctx.base,
      })
      .strict(),

  /**
   * A Method note carries the tag it anchors.
   *
   * Without this the two ends drift apart silently and in the worst direction: the note omits its
   * own tag, so the tag page that should lead with it does not list it at all, and the note is
   * absent from precisely the one page it exists to head. Nothing else would notice, because both
   * fields are independently valid.
   */
  refine: (frontmatter, refinement) => {
    if (frontmatter.tags.includes(frontmatter.facet_tag)) return;

    refinement.addIssue({
      code: "custom",
      path: ["tags"],
      message: `a method note must carry the tag it anchors (\`${frontmatter.facet_tag}\`)`,
    });
  },
});
