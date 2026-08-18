import { z } from "zod";

import { defineKind } from "../context";
import type { KindContext } from "../context";

/** The facet whose values an Application note may optionally anchor. */
export const APPLICATION_FACET = "application";

export const kind = defineKind({
  kind: "application",
  title: "Application",
  layer: "instance",
  summary:
    "This Foundry's account of one biological problem: what the task is, how it is scored, what currently does it best, and where topology sits.",
  shape: "file",
  companions: [],

  build: (ctx: KindContext) =>
    z
      .object({
        type: z.literal("application"),
        title: z.string().min(1),
        summary: z.string().min(20).max(160),
        assessed: z.iso.date(),
        facet_tag: z
          .string()
          .refine((value) => ctx.tags.facetOf(value) === APPLICATION_FACET, {
            message: `must be a value of the \`${APPLICATION_FACET}\` facet in meta_tags.yml`,
          })
          .optional(),
        ...ctx.base,
      })
      .strict(),

  refine: (frontmatter, refinement) => {
    if (
      frontmatter.facet_tag === undefined ||
      frontmatter.tags.includes(frontmatter.facet_tag)
    ) {
      return;
    }

    refinement.addIssue({
      code: "custom",
      path: ["tags"],
      message: `an application note must carry the tag it anchors (\`${frontmatter.facet_tag}\`)`,
    });
  },
});
