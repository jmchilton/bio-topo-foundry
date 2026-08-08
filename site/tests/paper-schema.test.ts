import path from "node:path";
import { describe, expect, it } from "vitest";

import { paperSchema } from "../src/lib/frontmatter-schema";
import { readFrontmatter } from "./frontmatter";

const validPaper = {
  type: "paper",
  title: "Example survey",
  summary: "A sufficiently descriptive summary of one external TDA survey.",
  citation: 'A. Author, "An example review of topological methods," arXiv:0000.00000 (2025).',
  source_url: "https://arxiv.org/abs/0000.00000",
  source_license: { status: "declared", id: "CC-BY-4.0" },
  derived: "own-words-summary",
  tags: ["method/persistent-homology"],
};

describe("paper kind", () => {
  it("validates its executable example", () => {
    const example = readFrontmatter(path.resolve("src/types/paper/example.md"));
    expect(paperSchema.safeParse(example).success).toBe(true);
  });

  it("represents a source that declares no license explicitly", () => {
    expect(
      paperSchema.safeParse({
        ...validPaper,
        source_license: { status: "missing" },
      }).success,
    ).toBe(true);
  });

  it.each([
    ["citation", { ...validPaper, citation: undefined }],
    ["source_url", { ...validPaper, source_url: "arxiv.org/abs/0000.00000" }],
    ["source_license.id", { ...validPaper, source_license: { status: "declared" } }],
    ["derived", { ...validPaper, derived: "paraphrase" }],
    ["tags", { ...validPaper, tags: [] }],
    ["tags", { ...validPaper, tags: ["method/not-registered"] }],
    ["extra", { ...validPaper, extra: "not part of the contract" }],
    // A package field on a paper: the two kinds describe different subjects and must not blur.
    ["repository", { ...validPaper, repository: "https://github.com/example/x" }],
  ])("rejects an invalid %s field", (_field, candidate) => {
    expect(paperSchema.safeParse(candidate).success).toBe(false);
  });
});

/**
 * The glossary makes summary posture a consequence of the source's license rather than an
 * authoring preference, so the schema has to check the pair, not each field alone.
 */
describe("summary posture coherence", () => {
  const withPosture = (id: string | undefined, derived: string) => ({
    ...validPaper,
    derived,
    source_license: id
      ? { status: "declared" as const, id }
      : { status: "missing" as const },
  });

  it("permits a license-aware summary of a verbatim-ok source", () => {
    expect(
      paperSchema.safeParse(withPosture("CC-BY-4.0", "license-aware-summary"))
        .success,
    ).toBe(true);
  });

  it.each([
    ["an own-words-only source", "CC-BY-NC-ND-4.0"],
    ["an arXiv distribution grant", "LicenseRef-arXiv-nonexclusive-distrib-1.0"],
    ["a source with no declared license", undefined],
  ])("refuses a license-aware summary of %s", (_case, id) => {
    const result = paperSchema.safeParse(withPosture(id, "license-aware-summary"));
    expect(result.success).toBe(false);
    expect(
      result.success ? [] : result.error.issues.map((issue) => issue.path.join(".")),
    ).toContain("derived");
  });

  it.each([
    ["CC-BY-4.0"],
    ["CC-BY-NC-ND-4.0"],
    ["LicenseRef-arXiv-nonexclusive-distrib-1.0"],
    [undefined],
  ])("always allows own words, here for %s", (id) => {
    expect(paperSchema.safeParse(withPosture(id, "own-words-summary")).success).toBe(
      true,
    );
  });
});
