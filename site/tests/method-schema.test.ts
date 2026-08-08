import path from "node:path";

import { describe, expect, it } from "vitest";

import { methodSchema } from "../src/lib/frontmatter-schema";
import { readFrontmatter } from "./frontmatter";

const validMethod = {
  type: "method",
  title: "Persistent Homology",
  summary: "Barcodes and persistence diagrams read off a filtration of the data.",
  facet_tag: "method/persistent-homology",
  tags: ["method/persistent-homology", "modality/point-cloud"],
};

const parses = (method: Record<string, unknown>) =>
  methodSchema.safeParse(method).success;

function issuesOf(method: Record<string, unknown>) {
  const result = methodSchema.safeParse(method);
  expect(result.success).toBe(false);
  if (result.success) return [];
  return result.error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

describe("method kind", () => {
  it("validates its executable example", () => {
    expect(
      methodSchema.safeParse(
        readFrontmatter(path.resolve("src/types/method/example.md")),
      ).success,
    ).toBe(true);
  });

  it("anchors a value of the method facet, not merely a registered tag", () => {
    expect(parses(validMethod)).toBe(true);
    expect(
      issuesOf({
        ...validMethod,
        facet_tag: "modality/point-cloud",
        tags: ["modality/point-cloud"],
      }),
    ).toContainEqual({
      path: "facet_tag",
      message: "must be a value of the `method` facet in meta_tags.yml",
    });
    expect(parses({ ...validMethod, facet_tag: "method/not-a-real-value" })).toBe(
      false,
    );
  });

  /**
   * The silent failure this kind exists to prevent: both fields stay individually valid while the
   * note goes missing from the one tag page it was written to head.
   */
  it("requires the note to carry the tag it anchors", () => {
    expect(
      issuesOf({
        ...validMethod,
        tags: ["modality/point-cloud"],
      }),
    ).toContainEqual({
      path: "tags",
      message:
        "a method note must carry the tag it anchors (`method/persistent-homology`)",
    });
  });

  it.each([
    ["empty tags", { ...validMethod, tags: [] }],
    ["extra field", { ...validMethod, repository: "https://example.org/method" }],
  ])("rejects an %s", (_case, candidate) => {
    expect(parses(candidate)).toBe(false);
  });
});
