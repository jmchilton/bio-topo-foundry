import { z } from "zod";

import { defineKind } from "../context";
import type { KindContext } from "../context";

/** biopixi's reproducibility ladder, from out-of-profile to single-package auto-container. */
export const PORTABILITY_GRADES = ["L0", "L1", "L2", "L3", "L4"] as const;

export const kind = defineKind({
  kind: "environment",
  title: "Environment",
  layer: "instance",
  summary:
    "A reproducible biopixi fixture that assembles packages and their dependencies into one runnable configuration, carrying a portability grade.",
  shape: "directory",
  companions: [
    {
      file: "pixi.toml",
      requirement: "required",
      purpose:
        "Standalone pixi manifest; `pixi install` resolves it with biopixi nowhere in sight.",
      disposition: "bundled",
    },
    {
      file: "pixi.lock",
      requirement: "recommended",
      purpose:
        "Solved lockfile pinning the exact closure the manifest resolved to on a real platform.",
      disposition: "bundled",
    },
  ],

  build: (ctx: KindContext) =>
    z
      .object({
        type: z.literal("environment"),
        title: z.string().min(1),
        summary: z.string().min(20).max(200),
        portability_grade: z.enum(PORTABILITY_GRADES),
        ...ctx.base,
      })
      .strict(),
});
