import { assemble } from "@galaxy-foundry/kind-schema";
import type { CollectionRoute } from "@galaxy-foundry/kind-schema/collections";

import { buildKindContext, DEFINITIONS } from "../types";
import { REGISTRIES } from "./registries";

const ctx = buildKindContext(REGISTRIES);

export const environmentSchema = assemble(DEFINITIONS.environment, ctx);
export const metaSchema = assemble(DEFINITIONS.meta, ctx);
export const methodSchema = assemble(DEFINITIONS.method, ctx);
export const moldSchema = assemble(DEFINITIONS.mold, ctx);
export const packageSchema = assemble(DEFINITIONS.package, ctx);
export const paperSchema = assemble(DEFINITIONS.paper, ctx);
export const replicationExperimentSchema = assemble(
  DEFINITIONS.replication_experiment,
  ctx,
);

export const NOTE_KINDS = {
  environment: environmentSchema,
  meta: metaSchema,
  method: methodSchema,
  mold: moldSchema,
  package: packageSchema,
  paper: paperSchema,
  replication_experiment: replicationExperimentSchema,
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
 * abstract subject, so `packages` sorts last and takes the bare slug. Every note also carries a
 * `<slug>-<kind>` alias, so any note is addressable without relying on this order at all.
 *
 * The patterns are globs because every writeup in the corpus is typed. The named-file lists these
 * replaced existed only to hold back unmigrated prose; with none left, a note that skips its
 * frontmatter should fail the build rather than be quietly excluded.
 */
export const COLLECTIONS = {
  // First, and so lowest in precedence: a record about the Foundry's own machinery should never
  // take a bare slug away from a note about topological data analysis, whatever the two happen to
  // be called.
  //
  // The only row whose key is not its base. `content/meta/` is where the Foundry pattern puts
  // design records and where the glossary already sits, so the directory is shared with the other
  // instances; `/design/` is what a reader is looking for in the navigation, and route policy is
  // this instance's to set. The two facts disagreeing is the honest state, not a mismatch to
  // paper over by renaming one of them.
  //
  // `glossary.md` shares the directory and is deliberately not a note: it is hand-curated,
  // alphabetical, and rendered by its own page. Excluded here, in the routing table, rather than
  // in the Astro loader alone — the corpus walk and the wiki-link map read this table too, and an
  // exclusion written in one consumer would start failing the glossary in the others.
  design: {
    base: "meta",
    pattern: ["*.md", "!glossary.md"],
    kind: "meta",
    schema: metaSchema,
  },
  // The first directory-shaped collection: the note is the `index.md`, and the manifest beside it
  // is a companion. `README.md` sits at the base rather than inside a fixture, so this pattern
  // never sees it.
  environments: {
    base: "environments",
    pattern: ["*/index.md"],
    kind: "environment",
    schema: environmentSchema,
  },
  // A method slug names a technique, so it never contends with a tool name for a bare address.
  // Ordered ahead of `packages` anyway: if the two ever did collide, the software should win the
  // bare slug for the same reason it wins today.
  methods: {
    base: "methods",
    pattern: ["*.md"],
    kind: "method",
    schema: methodSchema,
  },
  molds: {
    base: "molds",
    pattern: ["*/index.md"],
    kind: "mold",
    schema: moldSchema,
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
  // Last, so a study wins the bare slug over the software it tests. The three today are named for
  // what was replicated, so `topoqa-interface-quality` and `topoqa` never contend — but if a
  // future study took its subject's bare name, the note carrying our own evidence is the one a
  // reader typing that name wants.
  "replication-experiments": {
    base: "replication-experiments",
    pattern: ["*.md"],
    kind: "replication_experiment",
    schema: replicationExperimentSchema,
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
