import {
  buildKindManifest as deriveKindManifest,
  type KindManifest,
  type ManifestSource,
} from "@galaxy-foundry/kind-manifest";
import { manifestKinds } from "@galaxy-foundry/kind-schema";

import { buildKindContext, KINDS } from "../types";
import { COLLECTIONS } from "./frontmatter-schema";
import { REGISTRIES } from "./registries";

export const KIND_MANIFEST_INSTANCE =
  "topological-data-analysis-bioinformatics-foundry";

export const KIND_MANIFEST_SOURCE: ManifestSource = {
  repo: "jmchilton/bio-topo-foundry",
  path: "site/src/types/kinds.generated.json",
};

export interface BuildKindManifestOptions {
  docs?: Record<string, string>;
  examples?: Record<string, string>;
}

/** Bind the shared manifest format to this Foundry's kinds, context, and collection table. */
export function buildKindManifest({
  docs = {},
  examples = {},
}: BuildKindManifestOptions = {}): KindManifest {
  return deriveKindManifest({
    instance: KIND_MANIFEST_INSTANCE,
    source: KIND_MANIFEST_SOURCE,
    kinds: manifestKinds(KINDS, buildKindContext(REGISTRIES), {
      docs,
      examples,
      collections: COLLECTIONS,
    }),
  });
}
