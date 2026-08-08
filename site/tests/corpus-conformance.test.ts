import { describe, expect, it } from "vitest";

import { COLLECTIONS, contentPath } from "../src/lib/frontmatter-schema";
import { tagRegistry } from "../src/lib/meta-tags";
import { contentReader } from "../src/lib/content-reader";
import { readFrontmatter } from "./frontmatter";

describe("typed corpus slice", () => {
  it("validates every selected package with the content schema", () => {
    const problems: string[] = [];
    const tags = new Set<string>();
    const files = contentReader.noteFiles("packages");

    expect(files.length, "the package conformance check found no notes").toBeGreaterThan(0);

    for (const relativePath of files) {
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
