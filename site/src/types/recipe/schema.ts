import { z } from "zod";

import { defineKind } from "../context";
import type { KindContext } from "../context";

/** What the public conda channels fail to supply, which is the only reason to build a recipe. */
export const PACKAGING_GAPS = ["absent", "stale"] as const;

/** How far a recipe has travelled toward a public channel. */
export const UPSTREAMING_STATES = [
  "blocked",
  "eligible",
  "submitted",
  "published",
] as const;

export const kind = defineKind({
  kind: "recipe",
  title: "Recipe",
  layer: "instance",
  summary:
    "A rattler-build recipe in this repository that supplies a package the public conda channels do not, and the route by which it could leave.",
  shape: "file",
  companions: [],

  build: (ctx: KindContext) =>
    z
      .object({
        type: z.literal("recipe"),
        title: z.string().min(1),
        summary: z.string().min(20).max(200),
        gap: z.enum(PACKAGING_GAPS),
        build: z.discriminatedUnion("status", [
          z
            .object({
              status: z.literal("verified"),
              platforms: z.array(z.string().min(1)).min(1),
            })
            .strict(),
          z.object({ status: z.literal("unverified") }).strict(),
        ]),
        upstreaming: z.enum(UPSTREAMING_STATES),
        submission: z.url().optional(),
        ...ctx.base,
      })
      .strict(),

  /**
   * A recipe that claims to have left this repository has to say where it went.
   *
   * The claim is the one a reader acts on — it is the difference between "someone should open a
   * PR" and "stop, one is already open" — and it is the one that rots, because the work happens in
   * a tracker this repository cannot see. Requiring the link makes the claim checkable by a reader
   * in one click, and an unverifiable `submitted` unwritable.
   */
  refine: (frontmatter, refinement) => {
    const departed =
      frontmatter.upstreaming === "submitted" ||
      frontmatter.upstreaming === "published";
    if (departed && !frontmatter.submission) {
      refinement.addIssue({
        code: "custom",
        path: ["submission"],
        message: `\`upstreaming: ${frontmatter.upstreaming}\` must link the submission it claims`,
      });
    }
    if (!departed && frontmatter.submission) {
      refinement.addIssue({
        code: "custom",
        path: ["submission"],
        message:
          "a submission link belongs only to a recipe that has been submitted or published",
      });
    }
  },
});
