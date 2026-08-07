import { describe, expect, it } from "vitest";

import {
  COLLECTIONS,
  COLLECTION_NAMES,
  contentPath,
} from "../src/lib/frontmatter-schema";
import { tagRegistry } from "../src/lib/meta-tags";
import { contentReader } from "../src/lib/content-reader";
import { readFrontmatter } from "./frontmatter";

describe("typed corpus slice", () => {
  it("selects exactly the packages intentionally migrated", () => {
    expect(contentReader.noteFiles("packages")).toEqual([
      "packages/petls-pytorch.md",
      "packages/topometry.md",
    ]);
  });

  it("selects every paper writeup, because all of them are typed", () => {
    expect(contentReader.noteFiles("papers")).toEqual([
      "papers/tda-tdl-beyond-persistent-homology.md",
      "papers/tda-tdl-molecular-sciences.md",
    ]);
  });

  it("validates every selected note with its collection's schema", () => {
    const problems: string[] = [];

    for (const collection of COLLECTION_NAMES) {
      for (const relativePath of contentReader.noteFiles(collection)) {
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
});
