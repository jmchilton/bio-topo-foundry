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
import type { TagRegistry } from "@galaxy-foundry/tag-registry";

export interface BuildKindContextOptions {
  tags: TagRegistry;
  licensePolicy: LicensePolicy;
}

function buildPrimitives({ tags, licensePolicy }: BuildKindContextOptions) {
  const tag = z.string().refine((value) => tags.isValidTag(value), {
    message: "tag must be registered in meta_tags.yml",
  });
  const licenseId = z
    .string()
    .refine((value) => isValidLicenseId(licensePolicy, value), {
      message: "must be a curated SPDX id or a LicenseRef-<slug>",
    });

  return {
    base: {
      tags: z
        .array(tag)
        .min(1, "every note must carry at least one registered facet tag"),
    },
    licenseId,
  };
}

type Primitives = ReturnType<typeof buildPrimitives>;

export interface KindContext {
  base: Primitives["base"];
  licenseId: Primitives["licenseId"];
  /**
   * The redistribution table itself, for kinds that must ask what a license permits.
   *
   * `licenseId` only answers whether an id is spellable. A Source note additionally has to know
   * whether its source's row allows carrying upstream expression, which is a question about the
   * row, not the id.
   */
  licensePolicy: LicensePolicy;
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
  return { ...buildPrimitives(options), licensePolicy: options.licensePolicy };
}
