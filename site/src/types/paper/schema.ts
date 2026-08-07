import {
  declaresVerbatimCarry,
  resolveLicenseRow,
} from "@galaxy-foundry/license-policy";
import { z } from "zod";

import { defineKind } from "../context";
import type { KindContext } from "../context";

/** The two summary postures a Source note may declare, per the glossary. */
export const SUMMARY_POSTURES = [
  "own-words-summary",
  "license-aware-summary",
] as const;

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
        citation: z.string().min(20),
        source_url: z.url(),
        source_license: z.discriminatedUnion("status", [
          z
            .object({ status: z.literal("declared"), id: ctx.licenseId })
            .strict(),
          z.object({ status: z.literal("missing") }).strict(),
        ]),
        derived: z.enum(SUMMARY_POSTURES),
        ...ctx.base,
      })
      .strict(),

  /**
   * Summary posture is determined by the source's license, not chosen by the author.
   *
   * A note may always fall back to own words; it may only claim to carry upstream expression when
   * the source's row permits it. An undeclared license resolves deny-by-default, so `missing`
   * forecloses the license-aware posture without a separate branch here.
   */
  refine: (frontmatter, refinement, ctx: KindContext) => {
    if (!declaresVerbatimCarry(frontmatter.derived)) return;

    const licenseId =
      frontmatter.source_license.status === "declared"
        ? frontmatter.source_license.id
        : undefined;
    if (resolveLicenseRow(ctx.licensePolicy, licenseId).policy === "verbatim-ok")
      return;

    refinement.addIssue({
      code: "custom",
      path: ["derived"],
      message:
        "license-aware-summary requires a source license whose policy row is verbatim-ok",
    });
  },
});
