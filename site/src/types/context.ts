import { z } from "zod";

import {
  kindDefiner,
  type KindDefinition as LibKindDefinition,
  type KindShape,
} from "@galaxy-foundry/kind-schema";
import {
  isValidLicenseId,
  type LicensePolicy,
} from "@galaxy-foundry/license-policy";
import {
  contractKeys,
  type ContractGroup,
  type ReferenceContract,
} from "@galaxy-foundry/reference-contract";
import type { TagRegistry } from "@galaxy-foundry/tag-registry";

export interface BuildKindContextOptions {
  tags: TagRegistry;
  contract: ReferenceContract;
  licensePolicy: LicensePolicy;
}

function buildPrimitives({ tags, contract, licensePolicy }: BuildKindContextOptions) {
  const tag = z.string().refine((value) => tags.isValidTag(value), {
    message: "tag must be registered in meta_tags.yml",
  });
  const licenseId = z
    .string()
    .refine((value) => isValidLicenseId(licensePolicy, value), {
      message: "must be a curated SPDX id or a LicenseRef-<slug>",
    });

  const keys = (group: ContractGroup): [string, ...string[]] => {
    const values = contractKeys(contract, group);
    if (values.length === 0) {
      throw new Error(`reference contract: \`${group}\` is empty`);
    }
    return values as [string, ...string[]];
  };

  const reference = z
    .object({
      kind: z.enum(keys("kinds")),
      ref: z.string().min(1),
      used_at: z.enum(keys("used_at")),
      load: z.enum(keys("load")),
      mode: z.enum(keys("modes")),
      evidence: z.enum(keys("evidence")),
      purpose: z.string().optional(),
      trigger: z.string().optional(),
      verification: z.string().optional(),
    })
    .strict()
    .superRefine((value, ctx) => {
      if (value.load === "on-demand" && !value.trigger) {
        ctx.addIssue({
          code: "custom",
          path: ["trigger"],
          message: `on-demand ref "${value.ref}" requires a trigger`,
        });
      }
      if (value.evidence === "hypothesis" && !value.verification) {
        ctx.addIssue({
          code: "custom",
          path: ["verification"],
          message: `hypothesis-evidence ref "${value.ref}" requires a verification`,
        });
      }
    });

  return {
    base: {
      tags: z
        .array(tag)
        .min(1, "every note must carry at least one registered facet tag"),
    },
    licenseId,
    reference,
  };
}

type Primitives = ReturnType<typeof buildPrimitives>;

export interface KindContext {
  base: Primitives["base"];
  licenseId: Primitives["licenseId"];
  /** One entry in a Mold's typed reference manifest. */
  reference: Primitives["reference"];
  /**
   * The redistribution table itself, for kinds that must ask what a license permits.
   *
   * `licenseId` only answers whether an id is spellable. A Source note additionally has to know
   * whether its source's row allows carrying upstream expression, which is a question about the
   * row, not the id.
   */
  licensePolicy: LicensePolicy;
  /**
   * The tag registry itself, for kinds that must ask which facet declared a tag.
   *
   * Exposed for the same reason as {@link KindContext.licensePolicy}: `base.tags` only answers
   * whether a tag is registered, and a Method note additionally has to know that the tag it claims
   * to anchor belongs to the `method` facet rather than to any facet that happens to exist.
   */
  tags: TagRegistry;
}

export type { KindShape };
export type KindDefinition<T extends KindShape = KindShape> = LibKindDefinition<
  KindContext,
  T
>;
export const defineKind = kindDefiner<KindContext>();

export function buildKindContext(
  options: BuildKindContextOptions,
): KindContext {
  return {
    ...buildPrimitives(options),
    licensePolicy: options.licensePolicy,
    tags: options.tags,
  };
}
