import { readFileSync } from "node:fs";
import path from "node:path";

import { contentReaderStyleGaps } from "@galaxy-foundry/site-kit";
import { describe, expect, it } from "vitest";

import { contentReader } from "../src/lib/content-reader";
import {
  COLLECTIONS,
  COLLECTION_NAMES,
  contentPath,
} from "../src/lib/frontmatter-schema";

const WIKI_LINK = /\[\[([^\]|]+?)(?:\|[^\]]*)?\]\]/g;

/** Code spans and fences carry illustrative `[[Target]]` syntax that addresses nothing. */
const withoutCode = (markdown: string) =>
  markdown.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");

describe("shared content-reader binding", () => {
  it("maps every routed package into its package route", () => {
    const targets = contentReader.noteTargets("packages");
    expect(targets.length, "the route check found no packages").toBeGreaterThan(0);
    for (const { id, target } of targets) {
      expect(target).toEqual({ path: `packages/${id}` });
    }
  });

  it("maps this foundry's papers into its paper routes", () => {
    expect(
      contentReader.wikiLinkMap().get("tda-tdl-beyond-persistent-homology"),
    ).toEqual({ path: "papers/tda-tdl-beyond-persistent-homology" });
    expect(contentReader.wikiLinkMap().get("tda-tdl-molecular-sciences")).toEqual({
      path: "papers/tda-tdl-molecular-sciences",
    });
  });

  /**
   * Package and environment slugs coincide on purpose, so the bare address has to be assigned
   * rather than left to whichever collection happens to load last.
   */
  it("gives a shared slug to the package and the fixture a second address", () => {
    const map = contentReader.wikiLinkMap();
    expect(map.get("petls")).toEqual({ path: "packages/petls" });
    expect(map.get("petls-environment")).toEqual({
      path: "environments/petls",
    });

    // A fixture with no package of the same name keeps the bare slug for itself.
    expect(map.get("gudhi")).toEqual({ path: "environments/gudhi" });
    expect(map.get("gudhi-environment")).toEqual({
      path: "environments/gudhi",
    });
  });

  /**
   * The qualified address is uniform across kinds, so an author never has to know which slugs
   * happen to collide to know how to address a note.
   *
   * This also guards the one hazard the alias mechanism carries: a primary always wins, so a note
   * literally named `<slug>-<kind>` would take the address another note's alias wanted, and
   * nothing would report it. Asserting that every alias lands on its own note turns that silent
   * shadowing into a failure.
   */
  it("addresses every note as slug-kind, whatever else shares its slug", () => {
    const wrong: string[] = [];

    for (const collection of COLLECTION_NAMES) {
      const kind = COLLECTIONS[collection].kind;
      for (const id of contentReader.noteIds(collection)) {
        const href = contentReader.resolveLink(`${id}-${kind}`).href;
        const expected = `/${collection}/${id}/`;
        if (href !== expected) {
          wrong.push(`[[${id}-${kind}]] resolved to ${href}, wanted ${expected}`);
        }
      }
    }

    expect(wrong, wrong.join("\n")).toEqual([]);
  });

  it("resolves every wiki link authored in a typed note", () => {
    const broken: string[] = [];

    for (const collection of COLLECTION_NAMES) {
      for (const relativePath of contentReader.noteFiles(collection)) {
        const body = withoutCode(readFileSync(contentPath(relativePath), "utf8"));
        for (const [, target] of body.matchAll(WIKI_LINK)) {
          if (contentReader.resolveLink(target).href === null) {
            broken.push(`${relativePath}: [[${target}]]`);
          }
        }
      }
    }

    expect(broken, broken.join("\n")).toEqual([]);
  });

  it("supplies every theme role used by the shared content frame", () => {
    const css = readFileSync(path.resolve("src/styles/global.css"), "utf8");
    expect(contentReaderStyleGaps(css)).toEqual([]);
  });
});
