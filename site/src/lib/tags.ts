import { getCollection } from "astro:content";

import { base } from "./site-base";

export interface TaggedEntry {
  id: string;
  name: string;
  summary: string;
  tags: string[];
  url: string;
}

/** The local seam: which routed notes count as entries on this foundry's tag pages. */
export async function getTaggedEntries(): Promise<TaggedEntry[]> {
  return (await getCollection("packages")).map((entry) => ({
    id: entry.id,
    name: entry.data.title,
    summary: entry.data.summary,
    tags: entry.data.tags,
    url: `${base}/packages/${entry.id}/`,
  }));
}

export async function getEntriesByTag(): Promise<Map<string, TaggedEntry[]>> {
  const byTag = new Map<string, TaggedEntry[]>();
  for (const entry of await getTaggedEntries()) {
    for (const tag of entry.tags) {
      const entries = byTag.get(tag);
      if (entries) entries.push(entry);
      else byTag.set(tag, [entry]);
    }
  }
  return byTag;
}
