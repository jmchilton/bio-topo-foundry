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
  source_ids: { status: "declared", arxiv: "0000.00000" },
  access_date: "2026-07-29",
  source_read: "full-text",
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

  it("represents a source that carries no identifier at all", () => {
    expect(
      paperSchema.safeParse({
        ...validPaper,
        source_ids: { status: "none", reason: "unpublished working paper, no DOI assigned" },
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
    ["source_ids", { ...validPaper, source_ids: undefined }],
    ["source_ids", { ...validPaper, source_ids: { status: "declared" } }],
    ["source_ids", { ...validPaper, source_ids: { status: "none" } }],
    ["access_date", { ...validPaper, access_date: undefined }],
    ["source_read", { ...validPaper, source_read: undefined }],
    ["source_read", { ...validPaper, source_read: "skimmed" }],
    // A location is not an identity: source_url carries the first, source_ids the second.
    ["source_ids.doi", { ...validPaper, source_ids: { status: "declared", doi: "https://doi.org/10.1002/cnm.3376" } }],
    // Unquoted in YAML these become a Date and a number respectively, so the strings must be strict.
    ["access_date", { ...validPaper, access_date: new Date("2026-07-29") }],
    ["source_ids.pmid", { ...validPaper, source_ids: { status: "declared", pmid: 32614390 } }],
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
    // Carrying upstream expression obliges both the notice and the vendored license text; the
    // cases below vary only the license, so a carrying note supplies them throughout.
    attribution: "A. Author 2025, used under the source's license.",
    license_file: "LICENSES/CC-BY-4.0.txt",
    source_license: id
      ? { status: "declared" as const, id }
      : { status: "missing" as const },
  });

  it("permits a verbatim-quotes summary of a verbatim-ok source", () => {
    expect(
      paperSchema.safeParse(withPosture("CC-BY-4.0", "verbatim-quotes-summary"))
        .success,
    ).toBe(true);
  });

  it.each([
    ["an own-words-only source", "CC-BY-NC-ND-4.0"],
    ["an arXiv distribution grant", "LicenseRef-arXiv-nonexclusive-distrib-1.0"],
    ["a source with no declared license", undefined],
  ])("refuses a verbatim-quotes summary of %s", (_case, id) => {
    const result = paperSchema.safeParse(withPosture(id, "verbatim-quotes-summary"));
    expect(result.success).toBe(false);
    expect(
      result.success ? [] : result.error.issues.map((issue) => issue.path.join(".")),
    ).toContain("derived");
  });

  // The obligations the license itself imposes, which the posture alone does not discharge.
  it.each([
    ["the attribution notice", "attribution"],
    ["the vendored license file", "license_file"],
  ])("refuses verbatim carry missing %s", (_case, field) => {
    const result = paperSchema.safeParse({
      ...withPosture("CC-BY-4.0", "verbatim-quotes-summary"),
      [field]: undefined,
    });
    expect(result.success).toBe(false);
    expect(
      result.success ? [] : result.error.issues.map((issue) => issue.path.join(".")),
    ).toContain(field);
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
