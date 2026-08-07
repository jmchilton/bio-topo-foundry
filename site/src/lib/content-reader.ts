import { createContentReader } from "@galaxy-foundry/content-reader";

import { COLLECTIONS, contentPath } from "./frontmatter-schema";

/**
 * Bind shared content mechanics to this foundry's collection and route policy.
 *
 * The package schema and collection table stay local. The content-reader package owns only
 * filesystem selection and wiki-link plumbing over that table.
 */
export const contentReader = createContentReader({
  collections: COLLECTIONS,
  contentPath,
  targetOf: (collection, id) => ({ path: `${collection}/${id}` }),
});
