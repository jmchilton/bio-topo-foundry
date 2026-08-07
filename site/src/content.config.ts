import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";

import {
  COLLECTIONS,
  contentPath,
  stripExtension,
} from "./lib/frontmatter-schema";

const packages = COLLECTIONS.packages;

export const collections = {
  packages: defineCollection({
    loader: glob({
      pattern: [...packages.pattern],
      base: contentPath(packages.base),
      generateId: stripExtension,
    }),
    schema: packages.schema,
  }),
};
