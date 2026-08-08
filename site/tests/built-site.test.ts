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

import { contentReader } from "../src/lib/content-reader";
import { COLLECTION_NAMES } from "../src/lib/frontmatter-schema";

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
  it("emits infrastructure routes and exactly one page for every routed note", () => {
    const emitted = pages.map(relativePage).sort();
    const built = new Set(emitted);

    const infrastructure = [
      "index.html",
      "glossary/index.html",
      ...COLLECTION_NAMES.map((collection) => `${collection}/index.html`),
    ];
    expect(infrastructure.filter((page) => !built.has(page))).toEqual([]);

    /*
     * Both directions, so the check fails on an unrouted page as well as a missing one. Derived
     * from the corpus rather than counted, because a hard-coded total goes stale on every note
     * added and says nothing about which page is wrong.
     */
    const targets = contentReader.noteTargets();
    expect(targets.length, "the routed-note coverage check found no notes").toBeGreaterThan(0);
    expect(emitted.filter((page) => !infrastructure.includes(page))).toEqual(
      targets.map(({ target }) => `${target.path}/index.html`).sort(),
    );
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
    expect(home).toContain('href="/bio-topo-foundry/environments/"');
    expect(home).toContain('href="/bio-topo-foundry/glossary/"');
    expect(home).toContain(
      `Browse ${contentReader.noteTargets().length} typed notes`,
    );
  });

  it("renders the typed package facts through the shared content frame", () => {
    const petls = read(path.join(DIST, "packages/petls-pytorch/index.html"));
    expect(petls).toContain('class="content-note"');
    expect(petls).toContain("method/persistent-laplacian");
    expect(petls).toContain("Apache 2.0");
    expect(petls).toContain("verbatim OK");

    const upstreamPetls = read(path.join(DIST, "packages/petls/index.html"));
    expect(upstreamPetls).toContain('class="content-note"');
    expect(upstreamPetls).toContain("method/persistent-laplacian");
    expect(upstreamPetls).toContain("application/molecular-sciences");
    expect(upstreamPetls).toContain("modality/point-cloud");
    expect(upstreamPetls).toContain("modality/graph");
    expect(upstreamPetls).toContain("C++, Python");
    expect(upstreamPetls).toContain("Not declared upstream");

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

  /**
   * The companion row is measured from the directory at build time, so a fixture cannot render a
   * lockfile it does not have. That is the whole reason `locked` is not a frontmatter field.
   */
  it("renders each fixture's grade and its real companion state", () => {
    const locked = read(path.join(DIST, "environments/topometry-1.1/index.html"));
    expect(locked).toContain('data-grade="L1"');
    expect(locked).toContain('data-present="true"');
    expect(locked).not.toContain('data-present="false"');

    const unlocked = read(path.join(DIST, "environments/phat/index.html"));
    expect(unlocked).toContain('data-grade="L1"');
    expect(unlocked).toContain('data-present="false"');
    expect(unlocked).toContain("absent (recommended)");

    // The ladder groups the index, so the L0 rung has to be reachable as a heading.
    const index = read(path.join(DIST, "environments/index.html"));
    expect(index).toContain('id="grade-L0"');
    expect(index).toContain('id="grade-L4"');
  });

  /**
   * `petls` names both a software profile and a fixture built from it, so the rendered link has to
   * land on the one the author meant.
   */
  it("resolves a shared slug to the package and the fixture to its alias", () => {
    const fixture = read(path.join(DIST, "environments/petls/index.html"));
    expect(fixture).toContain('href="/bio-topo-foundry/packages/petls/"');

    const featurizer = read(
      path.join(DIST, "environments/open-topodockq-featurizer/index.html"),
    );
    expect(featurizer).toContain(
      'href="/bio-topo-foundry/environments/petls-pytorch/"',
    );
  });

  it("renders the loose glossary without corrupting wiki-link examples", () => {
    const glossary = read(path.join(DIST, "glossary/index.html"));
    expect(glossary).toContain('<p id="package"><strong>Package</strong>');
    expect(glossary).toContain("<code>[[Target]]</code>");
  });
});
