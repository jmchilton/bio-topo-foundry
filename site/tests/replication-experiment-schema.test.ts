import path from "node:path";

import { describe, expect, it } from "vitest";

import { replicationExperimentSchema } from "../src/lib/frontmatter-schema";
import { readFrontmatter } from "./frontmatter";

const REVISION = "f11ae40baf4592a7bcc64ba838e07501787cfa19";

const validStudy = {
  type: "replication_experiment",
  title: "TopoQA interface-quality replication",
  summary:
    "The released checkpoint reproduces the paper's ranking losses under a pinned protocol.",
  artifact: {
    repository: "https://github.com/jmchilton/topoqa-interface-quality-replication",
    revision: REVISION,
  },
  arc: ["replicate", "harden"],
  status: "running",
  redistribution: "mixed",
  tags: ["application/structure-qa"],
};

const parses = (study: Record<string, unknown>) =>
  replicationExperimentSchema.safeParse(study).success;

const messages = (study: Record<string, unknown>) => {
  const result = replicationExperimentSchema.safeParse(study);
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
};

describe("replication experiment kind", () => {
  it("validates its executable example and every study in the corpus", () => {
    for (const file of [
      "src/types/replication_experiment/example.md",
      "../content/replication-experiments/topoqa-interface-quality.md",
      "../content/replication-experiments/hiponet-melanoma.md",
      "../content/replication-experiments/topometry-cell-cycle.md",
    ]) {
      expect(
        replicationExperimentSchema.safeParse(readFrontmatter(path.resolve(file)))
          .success,
        file,
      ).toBe(true);
    }
  });

  it("pins evidence by full commit id, never by a branch or an abbreviation", () => {
    expect(parses(validStudy)).toBe(true);
    for (const revision of ["main", REVISION.slice(0, 12), REVISION.toUpperCase()]) {
      expect(
        parses({ ...validStudy, artifact: { ...validStudy.artifact, revision } }),
        revision,
      ).toBe(false);
    }
  });

  it("rejects a study with no replicate stage", () => {
    expect(parses({ ...validStudy, arc: ["harden", "extend"] })).toBe(false);
    expect(messages({ ...validStudy, arc: ["extend"] })).toContain(
      "every replication experiment must include a `replicate` stage",
    );
  });

  it("requires arc stages listed once each, in order", () => {
    expect(parses({ ...validStudy, arc: ["harden", "replicate"] })).toBe(false);
    expect(parses({ ...validStudy, arc: ["replicate", "replicate"] })).toBe(false);
    expect(parses({ ...validStudy, arc: ["replicate", "harden", "extend"] })).toBe(
      true,
    );
  });

  /**
   * The check the corpus exists to exercise: all three studies have finished upstream work and
   * none has been re-run here, so `complete` must not be reachable without the fixture that
   * would make it true.
   */
  it("lets a study be complete only once an environment has re-run it here", () => {
    const complete = {
      ...validStudy,
      status: "complete",
      replication_outcome: "reproduced",
    };
    expect(messages(complete)).toContain(
      "a complete replication experiment must name the environment that re-ran it here",
    );
    expect(parses({ ...complete, environment: "open-topoqa-scorer" })).toBe(true);
  });

  it("requires a complete study to record its outcome", () => {
    expect(
      messages({
        ...validStudy,
        status: "complete",
        environment: "open-topoqa-scorer",
      }),
    ).toContain("a complete replication experiment must record its outcome");
  });

  it("leaves outcome and environment optional while a study is still running", () => {
    expect(parses(validStudy)).toBe(true);
    expect(parses({ ...validStudy, status: "blocked" })).toBe(true);
  });
});
