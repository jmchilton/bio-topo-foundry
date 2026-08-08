import { contentReader } from "./content-reader";
import { COLLECTIONS } from "./frontmatter-schema";
import { base } from "./site-base";

export interface TaggedEntry {
  id: string;
  kind:
    | "Design record"
    | "Environment"
    | "Method"
    | "Mold"
    | "Package"
    | "Paper"
    | "Recipe"
    | "Replication experiment";
  name: string;
  summary: string;
  tags: string[];
  url: string;
  /** The tag page this note leads, when the kind declares that relationship. */
  anchorTag?: string;
}

const KIND_LABELS = {
  environment: "Environment",
  meta: "Design record",
  method: "Method",
  mold: "Mold",
  package: "Package",
  paper: "Paper",
  recipe: "Recipe",
  replication_experiment: "Replication experiment",
} as const satisfies Record<
  (typeof COLLECTIONS)[keyof typeof COLLECTIONS]["kind"],
  TaggedEntry["kind"]
>;

/** The local seam: which routed notes count as entries on this foundry's tag pages. */
export async function getTaggedEntries(): Promise<TaggedEntry[]> {
  return contentReader.contentIndex().notes.map((note) => {
    const meta = note.meta;
    if (!meta) {
      throw new Error(`${note.file}: tag browsing requires frontmatter`);
    }
    const name =
      typeof meta.name === "string"
        ? meta.name
        : typeof meta.title === "string"
          ? meta.title
          : undefined;
    const summary = typeof meta.summary === "string" ? meta.summary : undefined;
    const tags = meta.tags;
    if (
      !name ||
      !summary ||
      !Array.isArray(tags) ||
      !tags.every((tag): tag is string => typeof tag === "string")
    ) {
      throw new Error(`${note.file}: tag browse fields did not survive frontmatter validation`);
    }

    const kind = COLLECTIONS[note.collection].kind;
    return {
      id: note.id,
      kind: KIND_LABELS[kind],
      name,
      summary,
      tags,
      url: `${base}/${note.target.path}/`,
      ...(typeof meta.facet_tag === "string" ? { anchorTag: meta.facet_tag } : {}),
    };
  });
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
