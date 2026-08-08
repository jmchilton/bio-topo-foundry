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
  it("emits infrastructure routes and one page for every routed note", () => {
    const built = new Set(pages.map(relativePage));
    const infrastructure = [
      "glossary/index.html",
      "index.html",
      "packages/index.html",
      "tags/index.html",
    ];
    expect(infrastructure.filter((page) => !built.has(page))).toEqual([]);

    const targets = contentReader.noteTargets();
    expect(
      targets.length,
      "the routed-note coverage check found no notes",
    ).toBeGreaterThan(0);
    const missing = targets
      .filter(({ target }) => !built.has(`${target.path}/index.html`))
      .map(({ collection, id }) => `${collection}:${id}`);
    expect(
      missing,
      `\nrouted notes with no built page: ${missing.join(", ")}`,
    ).toEqual([]);
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
    expect(existsSync(path.join(DIST, "pagefind/pagefind-entry.json"))).toBe(
      true,
    );
  });

  it("uses the configured deployment base for internal links", () => {
    const home = read(path.join(DIST, "index.html"));
    expect(home).toContain('href="/bio-topo-foundry/packages/"');
    expect(home).toContain('href="/bio-topo-foundry/glossary/"');
    expect(home).toContain('href="/bio-topo-foundry/tags/"');
    expect(home).toContain(
      `Browse ${contentReader.noteTargets("packages").length} typed package`,
    );
  });

  it("builds a destination for every linked tag", () => {
    const built = new Set(pages.map(relativePage));
    const tagLinks = pages.flatMap((file) =>
      [
        ...read(file).matchAll(/href="\/bio-topo-foundry\/(tags\/[^"#?]+)\/"/g),
      ].map((match) => match[1]),
    );
    expect(
      tagLinks.length,
      "the built site contains no links to tag pages",
    ).toBeGreaterThan(0);

    const missing = [...new Set(tagLinks)]
      .filter((tagPath) => !built.has(`${tagPath}/index.html`))
      .sort();
    expect(
      missing,
      `\nlinked tag routes with no built page: ${missing.join(", ")}`,
    ).toEqual([]);
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

  it("renders the loose glossary without corrupting wiki-link examples", () => {
    const glossary = read(path.join(DIST, "glossary/index.html"));
    expect(glossary).toContain('<p id="package"><strong>Package</strong>');
    expect(glossary).toContain("<code>[[Target]]</code>");
  });
});
