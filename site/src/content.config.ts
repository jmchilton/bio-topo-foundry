import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";

import {
  COLLECTIONS,
  contentPath,
  stripExtension,
  stripNoteFile,
} from "./lib/frontmatter-schema";

const packages = COLLECTIONS.packages;
const papers = COLLECTIONS.papers;
const environments = COLLECTIONS.environments;

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
  environments: defineCollection({
    loader: glob({
      pattern: [...environments.pattern],
      base: contentPath(environments.base),
      generateId: stripNoteFile,
    }),
    schema: environments.schema,
  }),
};
