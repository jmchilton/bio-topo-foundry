import path from "node:path";

import { describe, expect, it } from "vitest";

import { applicationSchema } from "../src/lib/frontmatter-schema";
import { readFrontmatter } from "./frontmatter";

const validApplication = {
  type: "application",
  title: "Protein flexibility",
  summary: "How protein motion is represented, predicted, scored, and compared across experimental proxies.",
  assessed: "2026-08-17",
  tags: ["application/molecular-sciences", "modality/molecular-structure"],
};

const parses = (application: Record<string, unknown>) =>
  applicationSchema.safeParse(application).success;

function issuesOf(application: Record<string, unknown>) {
  const result = applicationSchema.safeParse(application);
  expect(result.success).toBe(false);
  if (result.success) return [];
  return result.error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

describe("application kind", () => {
  it("validates its executable example", () => {
    expect(
      applicationSchema.safeParse(
        readFrontmatter(path.resolve("src/types/application/example.md")),
      ).success,
    ).toBe(true);
  });

  it("does not require a broad application tag to have a landing page", () => {
    expect(parses(validApplication)).toBe(true);
  });

  it("only anchors a registered value of the application facet", () => {
    expect(
      parses({
        ...validApplication,
        facet_tag: "application/molecular-sciences",
      }),
    ).toBe(true);
    expect(
      issuesOf({
        ...validApplication,
        facet_tag: "modality/molecular-structure",
      }),
    ).toContainEqual({
      path: "facet_tag",
      message: "must be a value of the `application` facet in meta_tags.yml",
    });
    expect(
      parses({ ...validApplication, facet_tag: "application/not-a-real-value" }),
    ).toBe(false);
  });

  it("requires a declared anchor to be carried in tags", () => {
    expect(
      issuesOf({
        ...validApplication,
        facet_tag: "application/structure-qa",
      }),
    ).toContainEqual({
      path: "tags",
      message:
        "an application note must carry the tag it anchors (`application/structure-qa`)",
    });
  });

  it.each([
    ["missing assessment date", (({ assessed, ...rest }) => rest)(validApplication)],
    ["invalid assessment date", { ...validApplication, assessed: "17 August 2026" }],
    ["empty tags", { ...validApplication, tags: [] }],
    ["extra field", { ...validApplication, leaderboard: "mutable" }],
  ])("rejects an %s", (_case, candidate) => {
    expect(parses(candidate)).toBe(false);
  });
});
