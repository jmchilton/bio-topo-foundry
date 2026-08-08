import path from "node:path";
import { describe, expect, it } from "vitest";

import { environmentSchema } from "../src/lib/frontmatter-schema";
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

  /**
   * `pixi.lock` is recommended, not required, so its absence is tracked rather than tolerated
   * silently. A fixture that gains a lock should shorten this list, and one that loses a lock
   * should have to say so here.
   */
  it("names exactly the fixtures still waiting on a solved lockfile", () => {
    const lockPending = ids.filter((id) =>
      environmentCompanionCheck(id).missingRecommended.some(
        (companion) => companion.name === "pixi.lock",
      ),
    );

    expect(lockPending.sort()).toEqual([
      "giotto-ph",
      "giotto-tda",
      "petls",
      "phat",
      "pyflagser",
      "r-tda",
      "r-tdastats",
      "scikit-tda",
    ]);
  });

  it("reports companion presence from the directory, never from frontmatter", () => {
    const locked = environmentCompanions("topometry-1.1");
    expect(locked.map((state) => [state.companion.name, state.present])).toEqual([
      ["pixi.toml", true],
      ["pixi.lock", true],
    ]);

    const unlocked = environmentCompanions("phat");
    expect(unlocked.map((state) => [state.companion.name, state.present])).toEqual([
      ["pixi.toml", true],
      ["pixi.lock", false],
    ]);
  });
});
