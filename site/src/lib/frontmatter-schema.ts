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
  // Named files, because four package writeups are still untyped prose and must stay out until
  // they are migrated deliberately.
  packages: {
    base: "packages",
    pattern: ["petls-pytorch.md", "topometry.md"],
    kind: "package",
    schema: packageSchema,
  },
  // A glob, because every paper writeup in the corpus is typed. The stricter pattern is the honest
  // one here: a new paper note that skips its frontmatter should fail the build rather than be
  // quietly excluded.
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
