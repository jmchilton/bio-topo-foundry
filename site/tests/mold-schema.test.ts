import path from "node:path";

import { describe, expect, it } from "vitest";

import { moldSchema } from "../src/lib/frontmatter-schema";
import { contentReader } from "../src/lib/content-reader";
import { readFrontmatter } from "./frontmatter";

const validReference = {
  kind: "environment",
  ref: "open-topoqa-scorer-environment",
  used_at: "runtime",
  load: "upfront",
  mode: "verbatim",
  evidence: "corpus-observed",
};

const validMold = {
  type: "mold",
  name: "score-docking-poses",
  summary: "Rank candidate structures with a reproducible interface-quality scorer.",
  tags: ["application/structure-qa"],
  references: [validReference],
};

describe("mold kind", () => {
  it("validates its executable example and the first corpus Mold", () => {
    for (const file of [
      "src/types/mold/example.md",
      "../content/molds/score-docking-poses/index.md",
    ]) {
      expect(moldSchema.safeParse(readFrontmatter(path.resolve(file))).success).toBe(
        true,
      );
    }
  });

  it("accepts only reference kinds and modes this instance supports", () => {
    expect(
      moldSchema.safeParse({
        ...validMold,
        references: [{ ...validReference, kind: "package" }],
      }).success,
    ).toBe(false);
    expect(
      moldSchema.safeParse({
        ...validMold,
        references: [{ ...validReference, mode: "sidecar" }],
      }).success,
    ).toBe(false);
  });

  it("enforces conditional reference fields and rejects unknown ones", () => {
    for (const reference of [
      { ...validReference, load: "on-demand" },
      { ...validReference, evidence: "hypothesis" },
      { ...validReference, loade: "upfront" },
    ]) {
      expect(
        moldSchema.safeParse({ ...validMold, references: [reference] }).success,
      ).toBe(false);
    }

    expect(
      moldSchema.safeParse({
        ...validMold,
        references: [
          {
            ...validReference,
            load: "on-demand",
            trigger: "When a score cannot be reproduced.",
            evidence: "hypothesis",
            verification: "Exercise the reference in a real cast.",
          },
        ],
      }).success,
    ).toBe(true);
  });

  it("resolves every typed reference authored by a corpus Mold", () => {
    const broken: string[] = [];
    for (const file of contentReader.noteFiles("molds")) {
      const note = moldSchema.parse(readFrontmatter(path.resolve("../content", file)));
      for (const reference of note.references ?? []) {
        if (contentReader.resolveLink(reference.ref).href === null) {
          broken.push(`${file}: ${reference.kind}:${reference.ref}`);
        }
      }
    }
    expect(broken, broken.join("\n")).toEqual([]);
  });
});
