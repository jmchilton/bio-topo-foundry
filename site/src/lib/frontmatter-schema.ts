import { assemble } from "@galaxy-foundry/kind-schema";
import type { CollectionRoute } from "@galaxy-foundry/kind-schema/collections";

import { buildKindContext, DEFINITIONS } from "../types";
import { REGISTRIES } from "./registries";

const ctx = buildKindContext(REGISTRIES);

export const packageSchema = assemble(DEFINITIONS.package, ctx);
export const paperSchema = assemble(DEFINITIONS.paper, ctx);

export const NOTE_KINDS = {
  package: packageSchema,
  paper: paperSchema,
} as const;

export const CONTENT_DIR = "../content";
export const contentPath = (relativePath: string) =>
  `${CONTENT_DIR}/${relativePath}`;

export const COLLECTIONS = {
  // Globs, now that every writeup under both directories is typed. The named-file patterns these
  // replace existed only to hold back unmigrated prose; with none left, the stricter pattern is
  // the honest one — a new note that skips its frontmatter should fail the build rather than be
  // quietly excluded from the corpus.
  packages: {
    base: "packages",
    pattern: ["*.md"],
    kind: "package",
    schema: packageSchema,
  },
  papers: {
    base: "papers",
    pattern: ["*.md"],
    kind: "paper",
    schema: paperSchema,
  },
} as const satisfies Record<
  string,
  CollectionRoute & { kind: keyof typeof NOTE_KINDS; schema: unknown }
>;

export type CollectionName = keyof typeof COLLECTIONS;
export const COLLECTION_NAMES = Object.keys(
  COLLECTIONS,
) as readonly CollectionName[];

export const stripExtension = ({ entry }: { entry: string }) =>
  entry.replace(/\.md$/, "");
