import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  COLLECTIONS,
  contentPath,
  environmentSchema,
} from "../src/lib/frontmatter-schema";
import {
  environmentCompanionCheck,
  environmentCompanions,
} from "../src/lib/companions";
import { contentReader } from "../src/lib/content-reader";
import { readFrontmatter } from "./frontmatter";

const validEnvironment = {
  type: "environment",
  title: "example-fixture",
  summary: "A sufficiently descriptive summary of one runnable biopixi fixture.",
  portability_grade: "L3",
  tags: ["method/persistent-homology"],
};

describe("environment kind", () => {
  it("validates its executable example", () => {
    const example = readFrontmatter(
      path.resolve("src/types/environment/example.md"),
    );
    expect(environmentSchema.safeParse(example).success).toBe(true);
  });

  it.each([
    ["portability_grade", { ...validEnvironment, portability_grade: "L5" }],
    ["portability_grade", { ...validEnvironment, portability_grade: 3 }],
    ["tags", { ...validEnvironment, tags: [] }],
    ["extra", { ...validEnvironment, locked: true }],
    // `repository` belongs to the package kind; a fixture is not the software it assembles.
    ["repository", { ...validEnvironment, repository: "https://github.com/e/x" }],
  ])("rejects an invalid %s field", (_field, candidate) => {
    expect(environmentSchema.safeParse(candidate).success).toBe(false);
  });
});

/**
 * The first directory-shaped kind, so this is the first time companions are checked against real
 * directories rather than merely declared in a manifest.
 */
describe("fixture directories", () => {
  const ids = contentReader.noteIds("environments");

  it("gives every fixture the required manifest and no undeclared files", () => {
    const problems: string[] = [];

    for (const id of ids) {
      const check = environmentCompanionCheck(id);
      for (const missing of check.missingRequired) {
        problems.push(`${id}: missing required ${missing.name}`);
      }
      for (const unknown of check.unknown) {
        problems.push(`${id}: undeclared ${unknown.name}`);
      }
    }

    expect(problems, problems.join("\n")).toEqual([]);
  });

  it("reports companion presence from the directory, never from frontmatter", () => {
    const wrong: string[] = [];
    for (const id of ids) {
      for (const state of environmentCompanions(id)) {
        const expected = existsSync(
          contentPath(
            `${COLLECTIONS.environments.base}/${id}/${state.companion.name}`,
          ),
        );
        if (state.present !== expected) {
          wrong.push(
            `${id}/${state.companion.name}: reported ${state.present}, expected ${expected}`,
          );
        }
      }
    }
    expect(wrong, wrong.join("\n")).toEqual([]);
  });
});
