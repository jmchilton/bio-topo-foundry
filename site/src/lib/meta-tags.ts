import path from "node:path";

import {
  loadTagRegistry,
  type TagRegistry,
} from "@galaxy-foundry/tag-registry";

const TAGS_FILE = path.resolve("../meta_tags.yml");
let cached: TagRegistry | undefined;

export function tagRegistry(): TagRegistry {
  if (!cached) cached = loadTagRegistry(TAGS_FILE);
  return cached;
}
