import { assemble } from "@galaxy-foundry/kind-schema";
import type { CollectionRoute } from "@galaxy-foundry/kind-schema/collections";

import { buildKindContext, DEFINITIONS } from "../types";
import { REGISTRIES } from "./registries";

const ctx = buildKindContext(REGISTRIES);

export const environmentSchema = assemble(DEFINITIONS.environment, ctx);
export const packageSchema = assemble(DEFINITIONS.package, ctx);
export const paperSchema = assemble(DEFINITIONS.paper, ctx);

export const NOTE_KINDS = {
  environment: environmentSchema,
  package: packageSchema,
  paper: paperSchema,
} as const;

export const CONTENT_DIR = "../content";
export const contentPath = (relativePath: string) =>
  `${CONTENT_DIR}/${relativePath}`;

/**
 * Routed collections, in ascending wiki-link precedence: for a slug two collections share, the
 * later one wins the bare address.
 *
 * Package and environment slugs coincide by design — `petls`, `topometry`, `hiponet` and others
 * name both a software profile and a fixture built from it — so this order is a content decision,
 * not a formatting one. Prose that says `[[petls]]` almost always means the software, which is the
 * abstract subject, so `packages` sorts last and takes the bare slug. Every environment also
 * carries an explicit `<slug>-environment` alias, so the fixture is always addressable without
 * relying on this order at all.
 *
 * The patterns are globs because every writeup in the corpus is typed. The named-file lists these
 * replaced existed only to hold back unmigrated prose; with none left, a note that skips its
 * frontmatter should fail the build rather than be quietly excluded.
 */
export const COLLECTIONS = {
  // The first directory-shaped collection: the note is the `index.md`, and the manifest beside it
  // is a companion. `README.md` sits at the base rather than inside a fixture, so this pattern
  // never sees it.
  environments: {
    base: "environments",
    pattern: ["*/index.md"],
    kind: "environment",
    schema: environmentSchema,
  },
  papers: {
    base: "papers",
    pattern: ["*.md"],
    kind: "paper",
    schema: paperSchema,
  },
  packages: {
    base: "packages",
    pattern: ["*.md"],
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

/** A directory-shaped note is addressed by its directory, not by the `index.md` inside it. */
export const stripNoteFile = ({ entry }: { entry: string }) =>
  entry.replace(/\/index\.md$/, "");
