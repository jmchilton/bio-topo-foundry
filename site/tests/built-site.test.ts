import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import {
  contentReaderStyleGaps,
  licenseBadgeStyleGaps,
  searchIndexGaps,
  shellStyleGaps,
} from "@galaxy-foundry/site-kit";
import { beforeAll, describe, expect, it } from "vitest";

const SITE = new URL("../", import.meta.url).pathname;
const DIST = path.join(SITE, "dist");

function buildEnv(): NodeJS.ProcessEnv {
  const { BASE_URL, MODE, DEV, PROD, SSR, ...rest } = process.env;
  return rest;
}

function builtPages(dir: string = DIST): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    if (entry === "pagefind" || entry === "_astro") return [];
    if (statSync(full).isDirectory()) return builtPages(full);
    return entry.endsWith(".html") ? [full] : [];
  });
}

const relativePage = (file: string) => path.relative(DIST, file);
const read = (file: string) => readFileSync(file, "utf8");

let pages: string[];
let css: string;

beforeAll(() => {
  execFileSync("pnpm", ["run", "build"], {
    cwd: SITE,
    env: buildEnv(),
    stdio: "inherit",
  });
  pages = builtPages();
  css = readdirSync(path.join(DIST, "_astro"))
    .filter((entry) => entry.endsWith(".css"))
    .map((entry) => read(path.join(DIST, "_astro", entry)))
    .join("\n");
}, 600_000);

describe("the emitted reader slice", () => {
  it("contains exactly the twelve routes this slice claims", () => {
    expect(pages.map(relativePage).sort()).toEqual([
      "glossary/index.html",
      "index.html",
      "packages/hiponet/index.html",
      "packages/index.html",
      "packages/petls-pytorch/index.html",
      "packages/petls/index.html",
      "packages/topodockq/index.html",
      "packages/topometry/index.html",
      "packages/topoqa/index.html",
      "papers/index.html",
      "papers/tda-tdl-beyond-persistent-homology/index.html",
      "papers/tda-tdl-molecular-sciences/index.html",
    ]);
  });

  it("renders the shared shell accessibly on every page", () => {
    const broken = pages.filter((file) => {
      const html = read(file);
      return (
        !html.includes('href="#main"') ||
        !html.includes('id="main"') ||
        !html.includes("<header") ||
        !html.includes("<footer")
      );
    });
    expect(broken.map(relativePage)).toEqual([]);
  });

  it("emits every style contract used by the shared surfaces", () => {
    expect(shellStyleGaps(css)).toEqual([]);
    expect(contentReaderStyleGaps(css)).toEqual([]);
    expect(licenseBadgeStyleGaps(css)).toEqual([]);

    // Constructed so Tailwind cannot satisfy this assertion by scanning the test itself.
    const kitOnlyUtility = ["min", "h", "dvh"].join("-");
    expect(css).toContain(`.${kitOnlyUtility}`);
  });

  it("keeps every emitted page in the shared search contract", () => {
    expect(
      searchIndexGaps(
        pages.map((file) => ({ path: relativePage(file), html: read(file) })),
      ),
    ).toEqual([]);
    expect(existsSync(path.join(DIST, "pagefind/pagefind-entry.json"))).toBe(true);
  });

  it("uses the configured deployment base for internal links", () => {
    const home = read(path.join(DIST, "index.html"));
    expect(home).toContain('href="/bio-topo-foundry/packages/"');
    expect(home).toContain('href="/bio-topo-foundry/papers/"');
    expect(home).toContain('href="/bio-topo-foundry/glossary/"');
    expect(home).toContain("Browse 8 typed notes");
  });

  it("renders the typed package facts through the shared content frame", () => {
    const petls = read(path.join(DIST, "packages/petls-pytorch/index.html"));
    expect(petls).toContain('class="content-note"');
    expect(petls).toContain("method/persistent-laplacian");
    expect(petls).toContain("Apache 2.0");
    expect(petls).toContain("verbatim OK");

    const topometry = read(path.join(DIST, "packages/topometry/index.html"));
    expect(topometry).toContain('class="content-note"');
    expect(topometry).toContain("method/spectral-geometry");
    expect(topometry).toContain("application/single-cell");
    expect(topometry).toContain("modality/high-dim-tabular");
    expect(topometry).toContain("MIT");
    expect(topometry).toContain("verbatim OK");
  });

  /**
   * The corpus carries all three licence states, and only the first renders a policy row.
   *
   * `hiponet` pins the current gap: HiPoNet's Yale terms are known and non-commercial, but no
   * SPDX id names them, so the `LicenseRef-` escape hatch lands on the deny-by-default row and
   * the badge reports the safe answer rather than the accurate one. Asserted as it behaves today.
   */
  it("renders declared, missing, and unresolved software licences distinctly", () => {
    const topodockq = read(path.join(DIST, "packages/topodockq/index.html"));
    expect(topodockq).toContain("application/structure-qa");
    expect(topodockq).toContain("MIT");
    expect(topodockq).toContain("verbatim OK");

    for (const slug of ["petls", "topoqa"]) {
      expect(read(path.join(DIST, `packages/${slug}/index.html`))).toContain(
        "Not declared upstream",
      );
    }

    const hiponet = read(path.join(DIST, "packages/hiponet/index.html"));
    expect(hiponet).toContain("method/simplicial-learning");
    expect(hiponet).toContain('title="LicenseRef-yale-non-commercial"');
    expect(hiponet).toContain("own-words only");
  });

  /**
   * The two source notes summarize works whose licences differ but whose policy rows agree, so
   * the page has to show the row it actually resolved rather than a posture typed by hand.
   */
  it("renders each source note's licence row and declared posture", () => {
    const beyond = read(
      path.join(DIST, "papers/tda-tdl-beyond-persistent-homology/index.html"),
    );
    expect(beyond).toContain('class="content-note"');
    expect(beyond).toContain("method/topological-deep-learning");
    expect(beyond).toContain("arXiv non-exclusive distribution 1.0");
    expect(beyond).toContain("own-words only");
    expect(beyond).toContain("Own words");

    const molecular = read(
      path.join(DIST, "papers/tda-tdl-molecular-sciences/index.html"),
    );
    expect(molecular).toContain("application/molecular-sciences");
    expect(molecular).toContain("modality/molecular-structure");
    expect(molecular).toContain("CC BY-NC-ND 4.0");
    expect(molecular).toContain("own-words only");
  });

  it("renders the loose glossary without corrupting wiki-link examples", () => {
    const glossary = read(path.join(DIST, "glossary/index.html"));
    expect(glossary).toContain('<p id="package"><strong>Package</strong>');
    expect(glossary).toContain("<code>[[Target]]</code>");
  });
});
