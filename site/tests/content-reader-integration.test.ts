import { readFileSync } from "node:fs";
import path from "node:path";

import { contentReaderStyleGaps } from "@galaxy-foundry/site-kit";
import { describe, expect, it } from "vitest";

import { contentReader } from "../src/lib/content-reader";

describe("shared content-reader binding", () => {
  it("maps this foundry's packages into its package routes", () => {
    expect(contentReader.wikiLinkMap().get("petls-pytorch")).toEqual({
      path: "packages/petls-pytorch",
    });
    expect(contentReader.wikiLinkMap().get("topometry")).toEqual({
      path: "packages/topometry",
    });
  });

  it("maps this foundry's papers into its paper routes", () => {
    expect(
      contentReader.wikiLinkMap().get("tda-tdl-beyond-persistent-homology"),
    ).toEqual({ path: "papers/tda-tdl-beyond-persistent-homology" });
    expect(contentReader.wikiLinkMap().get("tda-tdl-molecular-sciences")).toEqual({
      path: "papers/tda-tdl-molecular-sciences",
    });
  });

  it("supplies every theme role used by the shared content frame", () => {
    const css = readFileSync(path.resolve("src/styles/global.css"), "utf8");
    expect(contentReaderStyleGaps(css)).toEqual([]);
  });
});
