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

const observed = {
  state: "CONFIRMED",
  uri: "quay.io/biocontainers/ripser:1.0.1--h9f5acd7_4",
  digest:
    "sha256:316e4319f94d9fd2de02e39f2910efa27d05b9a6760dd40e548c09b3a3d7cfea",
  observed_at: "2026-08-12T23:30:56.980Z",
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
 * The profile's rule that offline grading cannot reach L4: a grade is a claim about an image at a
 * registry, so the note has to carry the evidence for it or it cannot make the claim.
 */
describe("publication candidate", () => {
  it.each([
    ["an observed container", { ...validEnvironment, publication_candidate: observed }],
    [
      "an eligible but unobserved candidate below L4",
      {
        ...validEnvironment,
        publication_candidate: {
          state: "INFERRED",
          uri: "quay.io/biocontainers/dockq:2.1.3--py312h031d066_0",
        },
      },
    ],
    [
      "a checked negative",
      {
        ...validEnvironment,
        publication_candidate: {
          state: "UNREGISTERED",
          uri: "quay.io/biocontainers/dssp:4.6.1--np2py314h8ac4624_1",
          observed_at: "2026-08-12T23:30:56.980Z",
        },
      },
    ],
    ["an L4 backed by an observation", {
      ...validEnvironment,
      portability_grade: "L4",
      publication_candidate: observed,
    }],
  ])("accepts %s", (_case, candidate) => {
    const result = environmentSchema.safeParse(candidate);
    expect(result.error?.message ?? "", "unexpected rejection").toBe("");
    expect(result.success).toBe(true);
  });

  it.each([
    // The defect this field exists to prevent: an inference recorded as an observation.
    ["L4 with no candidate at all", { ...validEnvironment, portability_grade: "L4" }],
    [
      "L4 from an inference",
      {
        ...validEnvironment,
        portability_grade: "L4",
        publication_candidate: {
          state: "INFERRED",
          uri: "quay.io/biocontainers/ripser:1.0.1--h9f5acd7_4",
        },
      },
    ],
    [
      "an observation with no digest",
      {
        ...validEnvironment,
        publication_candidate: { ...observed, digest: undefined },
      },
    ],
    [
      "an observation with no time",
      {
        ...validEnvironment,
        publication_candidate: { ...observed, observed_at: undefined },
      },
    ],
    [
      "a digest that is not a sha256",
      { ...validEnvironment, publication_candidate: { ...observed, digest: "316e4319" } },
    ],
    [
      "a digest on a state that never establishes one",
      {
        ...validEnvironment,
        publication_candidate: {
          state: "REGISTERED",
          uri: "quay.io/biocontainers/dockq:2.1.3--py312h031d066_0",
          digest: observed.digest,
        },
      },
    ],
    [
      "a container reference carrying no tag",
      {
        ...validEnvironment,
        publication_candidate: { ...observed, uri: "quay.io/biocontainers/ripser" },
      },
    ],
    ["an unknown state", { ...validEnvironment, publication_candidate: { ...observed, state: "ASSUMED" } }],
  ])("rejects %s", (_case, candidate) => {
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
