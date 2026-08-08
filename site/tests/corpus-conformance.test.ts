import { describe, expect, it } from "vitest";

import {
  COLLECTIONS,
  COLLECTION_NAMES,
  contentPath,
  methodSchema,
} from "../src/lib/frontmatter-schema";
import { tagRegistry } from "../src/lib/meta-tags";
import { contentReader } from "../src/lib/content-reader";
import { readFrontmatter } from "./frontmatter";

describe("typed corpus slice", () => {
  it("selects fixture notes by directory and never the inventory README", () => {
    const files = contentReader.noteFiles("environments");
    expect(files.length, "the environment collection found no notes").toBeGreaterThan(0);
    expect(files.every((file) => file.endsWith("/index.md"))).toBe(true);
    expect(files).not.toContain("environments/README.md");
  });

  it("validates every selected note with its collection's schema", () => {
    const problems: string[] = [];
    let checked = 0;

    for (const collection of COLLECTION_NAMES) {
      for (const relativePath of contentReader.noteFiles(collection)) {
        checked += 1;
        const frontmatter = readFrontmatter(contentPath(relativePath));
        const result = COLLECTIONS[collection].schema.safeParse(frontmatter);
        if (result.success) continue;
        for (const issue of result.error.issues) {
          problems.push(
            `${relativePath}: ${issue.path.join(".") || "(root)"}: ${issue.message}`,
          );
        }
      }
    }

    expect(problems, problems.join("\n")).toEqual([]);
    expect(checked, "the conformance check found no notes").toBeGreaterThan(0);
  });

  /**
   * Seed only values a real note carries. A registry entry nothing uses is a browse axis that
   * renders an empty page, so the corpus and the vocabulary are asserted to agree in both
   * directions.
   */
  it("carries every registered tag on some note, and no unregistered tag", () => {
    const carried = new Set<string>();

    for (const collection of COLLECTION_NAMES) {
      for (const relativePath of contentReader.noteFiles(collection)) {
        const result = COLLECTIONS[collection].schema.safeParse(
          readFrontmatter(contentPath(relativePath)),
        );
        if (!result.success) continue;
        result.data.tags.forEach((tag: string) => carried.add(tag));
      }
    }

    expect([...carried].sort()).toEqual(tagRegistry().allTags().sort());
  });

  it("gives every method tag exactly one Method landing note", () => {
    const registry = tagRegistry();
    const declared = registry
      .allTags()
      .filter((tag) => registry.facetOf(tag) === "method")
      .sort();
    const notesByTag = new Map<string, string[]>();

    for (const relativePath of contentReader.noteFiles("methods")) {
      const method = methodSchema.parse(
        readFrontmatter(contentPath(relativePath)),
      );
      const notes = notesByTag.get(method.facet_tag);
      if (notes) notes.push(relativePath);
      else notesByTag.set(method.facet_tag, [relativePath]);
    }

    const anchored = [...notesByTag.keys()].sort();
    const duplicates = [...notesByTag]
      .filter(([, notes]) => notes.length > 1)
      .map(([tag, notes]) => `${tag}: ${notes.join(", ")}`);

    expect(anchored, "method tags and Method landing notes drifted").toEqual(
      declared,
    );
    expect(
      duplicates,
      `duplicate Method landing notes:\n${duplicates.join("\n")}`,
    ).toEqual([]);
  });
});
