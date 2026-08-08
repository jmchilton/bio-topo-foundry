import { getCollection, type CollectionEntry } from "astro:content";

import { base } from "./site-base";

export type DesignRecord = CollectionEntry<"design">;

/**
 * The two shelves, in the order they render.
 *
 * Foundation first because it is the one a newcomer needs: the infrastructure records describe
 * machinery whose existence the foundation records justify. Within a shelf the notes' own `order`
 * decides, and neither shelf carries a row list — which records exist is the collection's answer.
 */
export const RECORD_SHELVES = [
  {
    shelf: "foundation",
    title: "Foundry design records",
    summary:
      "Why the Foundry is shaped this way: the design pressure behind each choice, and what the choice costs.",
  },
  {
    shelf: "infrastructure",
    title: "Project infrastructure",
    summary:
      "How it is built: the code, the content contract, what runs, and where files belong.",
  },
] as const;

export type RecordShelf = (typeof RECORD_SHELVES)[number]["shelf"];

/**
 * One shelf's records, in reading order.
 *
 * `order` is unique within a shelf and not across both, so the shelf has to be selected before
 * the sort — over the whole collection the numbers collide.
 */
export async function designRecordsOnShelf(
  shelf: RecordShelf,
): Promise<DesignRecord[]> {
  const records = await getCollection("design");
  return records
    .filter((record) => record.data.record_kind === shelf)
    .sort((left, right) => left.data.order - right.data.order);
}

/** Every shelf with its records attached, ready to render. */
export async function designRecordShelves() {
  return Promise.all(
    RECORD_SHELVES.map(async (group) => ({
      ...group,
      records: await designRecordsOnShelf(group.shelf),
    })),
  );
}

/** The route a design record renders at — the collection key, like every other note here. */
export const designRecordHref = (record: DesignRecord) =>
  `${base}/design/${record.id}/`;
