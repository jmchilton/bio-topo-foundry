import { getCollection } from "astro:content";

import { base } from "./site-base";

export interface TaggedEntry {
  id: string;
  kind:
    | "Environment"
    | "Method"
    | "Mold"
    | "Package"
    | "Paper"
    | "Replication experiment";
  name: string;
  summary: string;
  tags: string[];
  url: string;
}

/** The local seam: which routed notes count as entries on this foundry's tag pages. */
export async function getTaggedEntries(): Promise<TaggedEntry[]> {
  return [
    ...(await getCollection("environments")).map((entry) => ({
      id: entry.id,
      kind: "Environment" as const,
      name: entry.data.title,
      summary: entry.data.summary,
      tags: entry.data.tags,
      url: `${base}/environments/${entry.id}/`,
    })),
    ...(await getCollection("packages")).map((entry) => ({
      id: entry.id,
      kind: "Package" as const,
      name: entry.data.title,
      summary: entry.data.summary,
      tags: entry.data.tags,
      url: `${base}/packages/${entry.id}/`,
    })),
    ...(await getCollection("molds")).map((entry) => ({
      id: entry.id,
      kind: "Mold" as const,
      name: entry.data.name,
      summary: entry.data.summary,
      tags: entry.data.tags,
      url: `${base}/molds/${entry.id}/`,
    })),
    ...(await getCollection("papers")).map((entry) => ({
      id: entry.id,
      kind: "Paper" as const,
      name: entry.data.title,
      summary: entry.data.summary,
      tags: entry.data.tags,
      url: `${base}/papers/${entry.id}/`,
    })),
    ...(await getCollection("replication-experiments")).map((entry) => ({
      id: entry.id,
      kind: "Replication experiment" as const,
      name: entry.data.title,
      summary: entry.data.summary,
      tags: entry.data.tags,
      url: `${base}/replication-experiments/${entry.id}/`,
    })),
    ...(await getCollection("methods")).map((entry) => ({
      id: entry.id,
      kind: "Method" as const,
      name: entry.data.title,
      summary: entry.data.summary,
      tags: entry.data.tags,
      url: `${base}/methods/${entry.id}/`,
    })),
  ];
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
