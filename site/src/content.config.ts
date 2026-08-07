import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";

import {
  COLLECTIONS,
  contentPath,
  stripExtension,
} from "./lib/frontmatter-schema";

const packages = COLLECTIONS.packages;
const papers = COLLECTIONS.papers;

export const collections = {
  packages: defineCollection({
    loader: glob({
      pattern: [...packages.pattern],
      base: contentPath(packages.base),
      generateId: stripExtension,
    }),
    schema: packages.schema,
  }),
  papers: defineCollection({
    loader: glob({
      pattern: [...papers.pattern],
      base: contentPath(papers.base),
      generateId: stripExtension,
    }),
    schema: papers.schema,
  }),
};
