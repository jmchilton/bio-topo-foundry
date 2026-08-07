import { describe, expect, it } from "vitest";

import { COLLECTIONS, contentPath } from "../src/lib/frontmatter-schema";
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

  it("validates every selected package with the content schema", () => {
    const problems: string[] = [];
    const tags = new Set<string>();

    for (const relativePath of contentReader.noteFiles("packages")) {
      const frontmatter = readFrontmatter(contentPath(relativePath));
      const result = COLLECTIONS.packages.schema.safeParse(frontmatter);
      if (!result.success) {
        for (const issue of result.error.issues) {
          problems.push(
            `${relativePath}: ${issue.path.join(".") || "(root)"}: ${issue.message}`,
          );
        }
      } else {
        result.data.tags.forEach((tag) => tags.add(tag));
      }
    }

    expect(problems, problems.join("\n")).toEqual([]);
    expect([...tags].sort()).toEqual(tagRegistry().allTags().sort());
  });
});
