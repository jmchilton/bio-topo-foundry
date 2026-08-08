import { createContentReader } from "@galaxy-foundry/content-reader";

import { COLLECTIONS, contentPath } from "./frontmatter-schema";

/**
 * Bind shared content mechanics to this foundry's collection and route policy.
 *
 * The kind schemas and collection table stay local. The content-reader package owns only
 * filesystem selection and wiki-link plumbing over that table.
 */
export const contentReader = createContentReader({
  collections: COLLECTIONS,
  contentPath,
  targetOf: (collection, id) => ({ path: `${collection}/${id}` }),

  /**
   * A fixture is always addressable as `<slug>-environment`, whether or not a package shares its
   * slug.
   *
   * Without this, `[[petls]]` means the software profile and the fixture has no address at all,
   * because precedence hands the bare slug to exactly one of them. Aliases never overwrite a
   * primary address, so this adds the second address without disturbing the first.
   */
  aliases: (_meta, id, collection) =>
    collection === "environments" ? [`${id}-environment`] : [],
});
