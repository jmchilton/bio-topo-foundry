import { z } from "zod";

import { defineKind } from "../context";
import type { KindContext } from "../context";

export const kind = defineKind({
  kind: "mold",
  title: "Mold",
  layer: "substrate",
  summary:
    "One abstract action whose typed reference manifest can be compiled into a runnable artifact.",
  shape: "directory",
  companions: [
    {
      file: "eval.md",
      requirement: "recommended",
      purpose: "Properties that any successful cast of this Mold must satisfy.",
      disposition: "foundry-only",
    },
    {
      file: "scenarios.md",
      requirement: "recommended",
      purpose: "Concrete cases used to exercise the Mold against its evaluation properties.",
      disposition: "foundry-only",
    },
  ],
  build: (ctx: KindContext) =>
    z
      .object({
        type: z.literal("mold"),
        name: z.string().min(1),
        summary: z.string().min(20).max(160),
        references: z.array(ctx.reference).optional(),
        ...ctx.base,
      })
      .strict(),
});
