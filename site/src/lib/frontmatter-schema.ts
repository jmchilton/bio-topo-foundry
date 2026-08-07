import { assemble } from "@galaxy-foundry/kind-schema";
import type { CollectionRoute } from "@galaxy-foundry/kind-schema/collections";

import { buildKindContext, DEFINITIONS } from "../types";
import { REGISTRIES } from "./registries";

const ctx = buildKindContext(REGISTRIES);

export const packageSchema = assemble(DEFINITIONS.package, ctx);

export const NOTE_KINDS = {
  package: packageSchema,
} as const;

export const CONTENT_DIR = "../content";
export const contentPath = (relativePath: string) =>
  `${CONTENT_DIR}/${relativePath}`;

export const COLLECTIONS = {
  packages: {
    base: "packages",
    pattern: ["petls-pytorch.md", "topometry.md"],
    kind: "package",
    schema: packageSchema,
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
