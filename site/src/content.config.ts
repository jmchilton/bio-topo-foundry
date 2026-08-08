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
const methods = COLLECTIONS.methods;
const environments = COLLECTIONS.environments;
const molds = COLLECTIONS.molds;
const replicationExperiments = COLLECTIONS["replication-experiments"];

export const collections = {
  packages: defineCollection({
    loader: glob({
      pattern: [...packages.pattern],
      base: contentPath(packages.base),
      generateId: stripExtension,
    }),
    schema: packages.schema,
  }),
  methods: defineCollection({
    loader: glob({
      pattern: [...methods.pattern],
      base: contentPath(methods.base),
      generateId: stripExtension,
    }),
    schema: methods.schema,
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
  "replication-experiments": defineCollection({
    loader: glob({
      pattern: [...replicationExperiments.pattern],
      base: contentPath(replicationExperiments.base),
      generateId: stripExtension,
    }),
    schema: replicationExperiments.schema,
  }),
  molds: defineCollection({
    loader: glob({
      pattern: [...molds.pattern],
      base: contentPath(molds.base),
      generateId: stripNoteFile,
    }),
    schema: molds.schema,
  }),
};
