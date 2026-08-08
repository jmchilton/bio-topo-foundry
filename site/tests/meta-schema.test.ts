import path from "node:path";

import { describe, expect, it } from "vitest";

import { contentReader } from "../src/lib/content-reader";
import { COLLECTIONS, metaSchema } from "../src/lib/frontmatter-schema";
import { readFrontmatter } from "./frontmatter";

const validRecord = {
  type: "meta",
  title: "Content Model",
  summary:
    "How TDA knowledge is represented here as kinds, collections, frontmatter, tags, links, and references.",
  record_kind: "infrastructure",
  order: 1,
  status: "draft",
  created: "2026-08-08",
  revised: "2026-08-08",
  revision: 1,
  tags: ["meta"],
};

const parses = (record: Record<string, unknown>) =>
  metaSchema.safeParse(record).success;

const messages = (record: Record<string, unknown>) => {
  const result = metaSchema.safeParse(record);
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
};

describe("meta kind", () => {
  it("validates its executable example", () => {
    expect(
      metaSchema.safeParse(
        readFrontmatter(path.resolve("src/types/meta/example.md")),
      ).success,
    ).toBe(true);
  });

  it("requires a shelf, a place on it, and the lifecycle envelope", () => {
    expect(parses(validRecord)).toBe(true);

    for (const field of [
      "title",
      "summary",
      "record_kind",
      "order",
      "status",
      "created",
      "revised",
      "revision",
      "tags",
    ]) {
      const { [field]: _dropped, ...without } = validRecord as Record<
        string,
        unknown
      >;
      expect(parses(without), `${field} is not required`).toBe(false);
    }
  });

  it("holds the shelf and the lifecycle to their declared vocabularies", () => {
    expect(parses({ ...validRecord, record_kind: "reference" })).toBe(false);
    expect(parses({ ...validRecord, status: "in-review" })).toBe(false);
    expect(parses({ ...validRecord, record_kind: "foundation" })).toBe(true);
  });

  it("numbers a shelf from one, in whole steps", () => {
    expect(parses({ ...validRecord, order: 0 })).toBe(false);
    expect(parses({ ...validRecord, order: 1.5 })).toBe(false);
    expect(parses({ ...validRecord, revision: 0 })).toBe(false);
  });

  /**
   * Both of these read as true forever. A `revised` date before `created` is a transposition, and
   * `status: revised` on a first revision claims an editing history the record does not have —
   * neither is caught by any per-field rule.
   */
  it("keeps the lifecycle internally consistent", () => {
    expect(
      messages({ ...validRecord, created: "2026-08-08", revised: "2026-07-01" }),
    ).toContain("a record cannot be revised before it was created");

    expect(messages({ ...validRecord, status: "revised" })).toContain(
      "`revised` claims an editing history, so `revision` must be at least 2",
    );
    expect(parses({ ...validRecord, status: "revised", revision: 2 })).toBe(true);
  });

  it("rejects an undeclared key, like every other kind here", () => {
    expect(parses({ ...validRecord, category: "foundation" })).toBe(false);
  });
});

describe("the design collection", () => {
  it("reads the shared meta directory and routes at design", () => {
    expect(COLLECTIONS.design.base).toBe("meta");
    expect(COLLECTIONS.design.kind).toBe("meta");
  });

  /**
   * The glossary is hand-curated and has its own route. Excluded in the routing table rather than
   * in the Astro loader alone, so the corpus walk and the wiki-link map honour it too — this
   * asserts the walk, which is the consumer that would otherwise fail the glossary.
   */
  it("never selects the hand-curated glossary as a note", () => {
    const files = contentReader.noteFiles("design");
    expect(files.length, "the design collection found no records").toBeGreaterThan(
      0,
    );
    expect(files).not.toContain("meta/glossary.md");
    expect(files.every((file) => file.startsWith("meta/"))).toBe(true);
  });

  /** `order` is unique within a shelf and deliberately not across both. */
  it("gives each shelf one record per position", () => {
    const shelves = new Map<string, number[]>();

    for (const file of contentReader.noteFiles("design")) {
      const record = metaSchema.parse(readFrontmatter(`../content/${file}`));
      const orders = shelves.get(record.record_kind) ?? [];
      orders.push(record.order);
      shelves.set(record.record_kind, orders);
    }

    for (const [shelf, orders] of shelves) {
      expect(new Set(orders).size, `${shelf} repeats a position`).toBe(
        orders.length,
      );
    }
  });
});
