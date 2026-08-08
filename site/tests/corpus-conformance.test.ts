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
});
