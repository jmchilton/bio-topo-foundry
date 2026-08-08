import { contractKeys } from "@galaxy-foundry/reference-contract";
import { describe, expect, it } from "vitest";

import { contentReader } from "../src/lib/content-reader";
import {
  referenceContract,
  SUPPORTED_MODES,
} from "../src/lib/reference-contract";
import { moldSchema } from "../src/lib/frontmatter-schema";
import { readFrontmatter } from "./frontmatter";

const usedValues = (field: "kind" | "mode"): string[] => {
  const values = new Set<string>();
  for (const file of contentReader.noteFiles("molds")) {
    const note = moldSchema.parse(readFrontmatter(`../content/${file}`));
    for (const reference of note.references ?? []) values.add(reference[field]);
  }
  return [...values].sort();
};

describe("this Foundry's reference contract", () => {
  it("declares exactly the reference kinds used by the current Mold corpus", () => {
    expect(contractKeys(referenceContract(), "kinds").sort()).toEqual(
      usedValues("kind"),
    );
  });

  it("narrows cast modes to implemented and exercised capacity", () => {
    expect(contractKeys(referenceContract(), "modes")).toEqual([
      ...SUPPORTED_MODES,
    ]);
    expect([...SUPPORTED_MODES].sort()).toEqual(usedValues("mode"));
  });
});
