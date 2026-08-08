import { z } from "zod";

import { defineKind } from "../context";
import type { KindContext } from "../context";

export const kind = defineKind({
  kind: "package",
  title: "Package",
  layer: "instance",
  summary:
    "A profile of one TDA or topological deep learning software project — upstream, or written here to replace one — and the code facts needed to evaluate and harden it.",
  shape: "file",
  companions: [],

  build: (ctx: KindContext) =>
    z
      .object({
        type: z.literal("package"),
        title: z.string().min(1),
        summary: z.string().min(20).max(160),
        repository: z.url(),
        languages: z.array(z.string().min(1)).min(1),
        software_license: z.discriminatedUnion("status", [
          z
            .object({ status: z.literal("declared"), id: ctx.licenseId })
            .strict(),
          z.object({ status: z.literal("missing") }).strict(),
        ]),
        ...ctx.base,
      })
      .strict(),
});
