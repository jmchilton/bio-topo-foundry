import path from "node:path";
import { describe, expect, it } from "vitest";

import { packageSchema } from "../src/lib/frontmatter-schema";
import { readFrontmatter } from "./frontmatter";

const validPackage = {
  type: "package",
  title: "Example package",
  summary:
    "A sufficiently descriptive summary of one upstream TDA software project.",
  repository: "https://github.com/example/package",
  languages: ["Python"],
  software_license: { status: "declared", id: "Apache-2.0" },
  tags: ["method/persistent-laplacian"],
};

describe("package kind", () => {
  it("validates its executable example", () => {
    const example = readFrontmatter(
      path.resolve("src/types/package/example.md"),
    );
    expect(packageSchema.safeParse(example).success).toBe(true);
  });

  it("represents an absent upstream software license explicitly", () => {
    expect(
      packageSchema.safeParse({
        ...validPackage,
        software_license: { status: "missing" },
      }).success,
    ).toBe(true);
  });

  it.each([
    ["repository", { ...validPackage, repository: undefined }],
    ["languages", { ...validPackage, languages: [] }],
    [
      "software_license.id",
      { ...validPackage, software_license: { status: "declared" } },
    ],
    ["tags", { ...validPackage, tags: [] }],
    ["tags", { ...validPackage, tags: ["method/not-registered"] }],
    ["extra", { ...validPackage, extra: "not part of the contract" }],
  ])("rejects an invalid %s field", (_field, candidate) => {
    expect(packageSchema.safeParse(candidate).success).toBe(false);
  });
});
