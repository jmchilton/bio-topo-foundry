import { z } from "zod";

import { defineKind } from "../context";
import type { KindContext } from "../context";

/** biopixi's reproducibility ladder, from out-of-profile to single-package auto-container. */
export const PORTABILITY_GRADES = ["L0", "L1", "L2", "L3", "L4"] as const;

/**
 * The state of the evidence behind a fixture's container, in biopixi's profile-v0 vocabulary.
 *
 * Only `CONFIRMED` rests on an observation; the other three describe what could be inferred from
 * files, which is why offline grading tops out at L3.
 */
export const CANDIDATE_STATES = [
  "UNREGISTERED",
  "INFERRED",
  "REGISTERED",
  "CONFIRMED",
] as const;

/** `registry/repository:tag` — a candidate without a tag does not name an image. */
const CONTAINER_URI = /^[^\s:/]+(\/[^\s:/]+)+:[^\s:/]+$/;

const containerUri = z
  .string()
  .regex(CONTAINER_URI, "must name a container as registry/repository:tag");

const publicationCandidate = z.discriminatedUnion("state", [
  z
    .object({
      state: z.literal("CONFIRMED"),
      uri: containerUri,
      // The two things that make an observation auditable rather than asserted.
      digest: z.string().regex(/^sha256:[0-9a-f]{64}$/),
      observed_at: z.iso.datetime(),
    })
    .strict(),
  z
    .object({
      state: z.enum(["UNREGISTERED", "INFERRED", "REGISTERED"]),
      uri: containerUri,
      // Optional, and a negative rather than a promotion: when the registry was last asked.
      observed_at: z.iso.datetime().optional(),
    })
    .strict(),
]);

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
        publication_candidate: publicationCandidate.optional(),
        ...ctx.base,
      })
      .strict()
      .superRefine((value, issues) => {
        if (
          value.portability_grade === "L4" &&
          value.publication_candidate?.state !== "CONFIRMED"
        ) {
          issues.addIssue({
            code: "custom",
            path: ["portability_grade"],
            message:
              "L4 asserts an image was observed at a registry, so it requires a CONFIRMED publication_candidate",
          });
        }
      }),
});
