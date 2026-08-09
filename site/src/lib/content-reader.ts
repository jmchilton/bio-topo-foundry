import { createContentReader } from "@galaxy-foundry/content-reader";

import type { ContentReaderOptions } from "@galaxy-foundry/content-reader";

import { COLLECTIONS, contentPath } from "./frontmatter-schema";

type ContentPath = ContentReaderOptions<
  typeof COLLECTIONS,
  { path: string; title?: string }
>["contentPath"];

/**
 * Bind shared content mechanics to this foundry's collection and route policy.
 *
 * The kind schemas and collection table stay local. The content-reader package owns only
 * filesystem selection and wiki-link plumbing over that table.
 */
export function createFoundryContentReader(resolveContentPath: ContentPath) {
  return createContentReader({
    collections: COLLECTIONS,
    contentPath: resolveContentPath,
    targetOf: (collection, id, meta) => ({
      path: `${collection}/${id}`,
      ...(typeof meta?.summary === "string" ? { title: meta.summary } : {}),
    }),

    /**
     * Every note is addressable as `<slug>-<kind>`, whatever else shares its slug.
     *
     * Five slugs name both a package and an environment — `petls`, `topometry`, `hiponet`,
     * `petls-pytorch`, `topodockq` — because this corpus builds a fixture per tool and names it
     * after the tool. Precedence hands each bare slug to exactly one of them, so without a second
     * address the other is unreachable. Aliases never overwrite a primary, so this adds an address
     * without disturbing one.
     *
     * It is generated for every collection rather than only the colliding ones, because which slugs
     * collide is a fact about the corpus today. Adding a `gudhi` package would silently retarget
     * `[[gudhi]]`; the qualified form has to already exist for that to be a non-event. Keyed on the
     * collection's `kind`, which is singular and authoritative, rather than on a singularized
     * collection name.
     */
    aliases: (_meta, id, collection) => [
      `${id}-${COLLECTIONS[collection].kind}`,
    ],
  });
}

/** The site process binds the shared reader to Astro's content-relative filesystem frame. */
export const contentReader = createFoundryContentReader(contentPath);
