import { existsSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { DETAIL_ROUTES } from "../src/lib/detail-routes";
import { COLLECTION_NAMES } from "../src/lib/frontmatter-schema";

describe("shared detail route", () => {
  it("describes every routed collection in both directions", () => {
    expect(Object.keys(DETAIL_ROUTES).sort()).toEqual([...COLLECTION_NAMES].sort());
  });

  it("keeps collection detail pages behind one Astro route", () => {
    expect(
      existsSync(path.resolve("src/pages/[collection]/[...slug].astro")),
    ).toBe(true);
  });
});
