import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import {
  contentReaderStyleGaps,
  licenseBadgeStyleGaps,
  referenceStyleGaps,
  searchIndexGaps,
  shellStyleGaps,
} from "@galaxy-foundry/site-kit";
import { sharesPage, specimenPath } from "@galaxy-foundry/site-kit/specimens";
import { beforeAll, describe, expect, it } from "vitest";

import { contentReader } from "../src/lib/content-reader";
import { environmentCompanions } from "../src/lib/companions";
import { listAllCasts } from "../src/lib/casts";
import { ALL_SPECIMENS, TDA_SPECIMENS } from "../src/lib/gallery";
import { vendoredLicenses } from "../src/lib/licenses";
import {
  COLLECTION_NAMES,
  contentPath,
  methodSchema,
} from "../src/lib/frontmatter-schema";
import { readFrontmatter } from "./frontmatter";

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

const STANDALONE_SPECIMEN_PAGES = ALL_SPECIMENS.filter(
  (group) => !sharesPage(group),
).flatMap((group) =>
  group.specimens.map(
    (specimen) => `gallery/${specimenPath(group, specimen)}/index.html`,
  ),
);

// Isolated specimens intentionally render one component in an otherwise bare document. Document
// specimens are SiteShell itself and must continue satisfying the ordinary shell assertions.
const BARE_SPECIMEN_PAGES = ALL_SPECIMENS.filter(
  (group) => group.surface === "isolated",
).flatMap((group) =>
  group.specimens.map(
    (specimen) => `gallery/${specimenPath(group, specimen)}/index.html`,
  ),
);

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
      "index.html",
      "gallery/index.html",
      "glossary/index.html",
      "tags/index.html",
      "licenses/index.html",
      "usage/index.html",
      ...listAllCasts(path.resolve(SITE, ".."))
        .filter((cast) => cast.target === "claude" && cast.hasSkill)
        .map((cast) => `usage/claude/${cast.moldSlug}/index.html`),
      ...COLLECTION_NAMES.map((collection) => `${collection}/index.html`),
      ...vendoredLicenses().map((license) => `licenses/${license.file.id}/index.html`),
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
      if (BARE_SPECIMEN_PAGES.includes(relativePage(file))) return false;
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
    expect(referenceStyleGaps(css)).toEqual([]);

    // Constructed so Tailwind cannot satisfy this assertion by scanning the test itself.
    const kitOnlyUtility = ["min", "h", "dvh"].join("-");
    expect(css).toContain(`.${kitOnlyUtility}`);
  });

  it("self-hosts the editorial serif, sans, and mono type system", () => {
    expect(css).toContain("Source Serif 4 Variable");
    expect(css).toContain("IBM Plex Sans Variable");
    expect(css).toContain("IBM Plex Mono");

    const assets = readdirSync(path.join(DIST, "_astro"));
    expect(assets.some((asset) => asset.includes("source-serif-4") && asset.endsWith(".woff2"))).toBe(
      true,
    );
    expect(assets.some((asset) => asset.includes("ibm-plex-sans") && asset.endsWith(".woff2"))).toBe(
      true,
    );
    expect(assets.some((asset) => asset.includes("ibm-plex-mono") && asset.endsWith(".woff2"))).toBe(
      true,
    );
  });

  it("keeps every emitted page in the shared search contract", () => {
    expect(
      searchIndexGaps(
        pages.map((file) => ({ path: relativePage(file), html: read(file) })),
        STANDALONE_SPECIMEN_PAGES,
      ),
    ).toEqual([]);
    expect(existsSync(path.join(DIST, "pagefind/pagefind-entry.json"))).toBe(
      true,
    );
  });

  it("uses the configured deployment base for internal links", () => {
    const home = read(path.join(DIST, "index.html"));
    expect(home).toContain('href="/bio-topo-foundry/packages/"');
    expect(home).toContain('href="/bio-topo-foundry/papers/"');
    expect(home).toContain('href="/bio-topo-foundry/environments/"');
    expect(home).toContain('href="/bio-topo-foundry/molds/"');
    expect(home).toContain('href="/bio-topo-foundry/usage/"');
    expect(home).toContain('href="/bio-topo-foundry/glossary/"');
    expect(home).toContain('href="/bio-topo-foundry/tags/"');
    expect(home).toContain('href="/bio-topo-foundry/design/#shelf-foundation"');
    expect(home).toContain(
      `Browse ${contentReader.noteTargets().length} typed notes`,
    );
  });

  it("renders the homepage filtration as an accessible progressive enhancement", () => {
    const home = read(path.join(DIST, "index.html"));
    expect(home).toContain('data-filtration-stage="3"');
    expect(home).toContain('type="range"');
    expect(home).toContain('aria-labelledby="filtration-title filtration-description"');
    expect(home).toContain('class="persistent-cycle"');
    expect(home).toContain('class="filtration-control"');
    expect(home).toContain('data-persistence-divider');
  });

  it("renders deterministic geometric marginalia on note indexes and details", () => {
    const packages = read(path.join(DIST, "packages/index.html"));
    const detail = read(path.join(DIST, "packages/petls-pytorch/index.html"));

    expect(packages).toContain('data-point-cloud-fingerprint');
    expect(packages).toContain('class="fingerprint-loop"');
    expect(detail).toContain('class="topology-breadcrumb"');
    expect(detail).toContain('aria-current="page"');
    expect(detail).toContain('data-point-cloud-fingerprint');
    expect(detail).toContain('data-persistence-divider');
    expect(detail).not.toContain('class="content-back"');
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

  it("features every Method as the guide for the tag it anchors", () => {
    const files = contentReader.noteFiles("methods");
    const targets = contentReader.noteTargets("methods");
    expect(targets).toHaveLength(files.length);

    for (const [index, file] of files.entries()) {
      const method = methodSchema.parse(readFrontmatter(contentPath(file)));
      const html = read(path.join(DIST, `tags/${method.facet_tag}/index.html`));
      const guideStart = html.indexOf('<h2 id="tag-guide">Method guide</h2>');
      const guideEnd = html.indexOf("</section>", guideStart);
      const methodLink = `href="/bio-topo-foundry/${targets[index].target.path}/"`;

      expect(guideStart, `${method.facet_tag} has no Method guide`).toBeGreaterThan(-1);
      expect(
        html.indexOf(methodLink),
        `${method.facet_tag} does not feature ${file}`,
      ).toBeGreaterThan(guideStart);
      expect(html.indexOf(methodLink)).toBeLessThan(guideEnd);
      expect(html.split(methodLink)).toHaveLength(2);
    }
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

  it("renders declared, missing, and custom software licences distinctly", () => {
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
    expect(hiponet).toContain(">yale-non-commercial</span>");
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
  it("renders every fixture's measured companion state", () => {
    for (const id of contentReader.noteIds("environments")) {
      const html = read(path.join(DIST, `environments/${id}/index.html`));
      const states = environmentCompanions(id);
      for (const { companion } of states) {
        expect(html).toContain(`<code>${companion.name}</code>`);
      }
      expect([...html.matchAll(/<li data-present="true">/g)]).toHaveLength(
        states.filter(({ present }) => present).length,
      );
      expect([...html.matchAll(/<li data-present="false">/g)]).toHaveLength(
        states.filter(({ present }) => !present).length,
      );
    }

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

  /**
   * The design index is the one page whose subject is the Foundry rather than the domain, and the
   * separation is the point: both shelves are anchored so the homepage can land on one, and the
   * records reach the reader through the same routed detail page every other note uses.
   */
  it("shelves the design records apart from the domain corpus", () => {
    const index = read(path.join(DIST, "design/index.html"));
    expect(index).toContain('id="shelf-foundation"');
    expect(index).toContain('id="shelf-infrastructure"');
    expect(index).toContain('href="/bio-topo-foundry/design/content-model/"');
    expect(index).toContain(
      'href="/bio-topo-foundry/design/replication-experiments/"',
    );
    expect(index).toContain('href="/bio-topo-foundry/gallery/"');

    /**
     * `order` exists for exactly one thing, and this is it: the sequence is pedagogical, so a
     * shelf sorted by anything else — id, title, discovery — reads as a list of records rather
     * than a path through them, and nothing else would report the difference.
     */
    const recordsIn = (section: string) =>
      [
        ...section.matchAll(/href="\/bio-topo-foundry\/design\/([^"]+)\/"/g),
      ].map((match) => match[1]);

    const foundationStart = index.indexOf('id="shelf-foundation"');
    const infrastructureStart = index.indexOf('id="shelf-infrastructure"');
    expect(foundationStart).toBeLessThan(infrastructureStart);

    expect(
      recordsIn(index.slice(foundationStart, infrastructureStart)),
    ).toEqual([
      "positioning",
      "guiding-principles",
      "architecture",
      "replication-experiments",
    ]);
    expect(recordsIn(index.slice(infrastructureStart))).toEqual([
      "code-architecture",
      "content-model",
      "repository-layout",
      "build-and-validation",
    ]);

    const record = read(path.join(DIST, "design/content-model/index.html"));
    expect(record).toContain('class="content-note"');
    expect(record).toContain("Infrastructure — what");
    expect(record).toContain('href="/bio-topo-foundry/tags/meta/"');
    expect(record).toContain('href="/bio-topo-foundry/design/"');

    // The record's own body link, resolved through the shared map like any other note's.
    const policy = read(
      path.join(DIST, "design/replication-experiments/index.html"),
    );
    expect(policy).toContain("Foundation — why");
    expect(policy).toContain('href="/bio-topo-foundry/design/content-model/"');
  });

  it("renders the code architecture as an accessible, theme-native dependency map", () => {
    const architecture = read(
      path.join(DIST, "design/code-architecture/index.html"),
    );

    expect(architecture).toContain('class="architecture-diagram"');
    expect(architecture).toContain(
      'aria-labelledby="architecture-title architecture-description"',
    );
    expect(architecture).toContain(
      'aria-label="Scrollable code architecture dependency map"',
    );
    expect(architecture).toContain(
      "https://github.com/jmchilton/foundry-lib/tree/main/packages/kind-schema",
    );
    expect(architecture).toContain(
      "https://github.com/jmchilton/foundry-lib/tree/main/packages/content-reader",
    );
    expect(architecture).toContain(
      "https://github.com/jmchilton/foundry-lib/tree/main/packages/site-kit",
    );
    expect(architecture).toContain(
      "https://github.com/jmchilton/foundry-lib/tree/main/packages/audit-citations",
    );
    expect(css).toContain(".architecture-map");
    expect(css).toContain("var(--color-surface-raised)");
    expect(css).toContain("var(--color-text-primary)");

    // A blank line inside the raw block ends it, and Markdown reads the indented remainder as a
    // code fence. The opening tags survive that, so assert the whole figure came through as markup.
    expect(architecture).not.toContain("&#x3C;");
    expect(architecture.slice(architecture.indexOf("architecture-map"))).not.toContain(
      "astro-code",
    );
    expect(architecture).toContain('class="architecture-canvas"');
    expect(architecture).toContain("</svg>");
    expect(architecture).toContain("</figure>");
  });

  /** The glossary shares `content/meta/` with the records and is deliberately not one of them. */
  it("keeps the glossary out of the design collection's routes", () => {
    const built = new Set(pages.map(relativePage));
    expect(built.has("glossary/index.html")).toBe(true);
    expect(built.has("design/glossary/index.html")).toBe(false);
  });

  it("renders every shared and TDA specimen in the component gallery", () => {
    const gallery = read(path.join(DIST, "gallery/index.html"));
    const expectedCases = ALL_SPECIMENS.reduce(
      (total, group) => total + group.specimens.length,
      0,
    );

    expect(
      [...gallery.matchAll(/class="gallery-specimen"/g)],
      "the gallery dropped a specimen case",
    ).toHaveLength(expectedCases);

    for (const group of ALL_SPECIMENS) {
      expect(gallery).toContain(`id="${group.id}"`);
      expect(gallery).toContain(`data-gallery-component="${group.component}"`);
    }

    for (const group of TDA_SPECIMENS) {
      expect(gallery).toContain(`id="${group.id}"`);
      expect(gallery).toContain('data-gallery-origin="tda"');
    }
  });

  it("builds and frames every specimen that cannot share the gallery page", () => {
    const gallery = read(path.join(DIST, "gallery/index.html"));
    const built = new Set(pages.map(relativePage));

    expect(STANDALONE_SPECIMEN_PAGES.length).toBeGreaterThan(0);
    expect(
      STANDALONE_SPECIMEN_PAGES.filter((page) => !built.has(page)),
      "standalone specimen routes missing from the build",
    ).toEqual([]);

    for (const page of STANDALONE_SPECIMEN_PAGES) {
      const route = page.replace(/index\.html$/, "");
      expect(gallery).toContain(`src="/bio-topo-foundry/${route}"`);
    }

    const filtration = read(
      path.join(DIST, "gallery/tda-filtration-hero/stable-loop/index.html"),
    );
    expect(filtration).toContain('data-filtration-stage="3"');
    expect(filtration).toContain('type="range"');
    expect(filtration).toContain('<meta name="robots" content="noindex">');
  });

  it("renders each Mold's typed reference manifest", () => {
    const mold = read(path.join(DIST, "molds/score-docking-poses/index.html"));
    expect(mold).toContain('class="reference-contract"');
    expect(mold).toContain('class="reference-card"');
    expect(mold).toContain('href="/bio-topo-foundry/environments/open-topoqa-scorer/"');
    expect(mold).toContain("Supplies the runnable featurizer and scorer");
    expect(mold).toContain("Corpus Observed");
    expect(mold).toContain('href="/bio-topo-foundry/usage/claude/score-docking-poses/"');
  });

  it("publishes install instructions and one inspectable page per cast skill", () => {
    const usage = read(path.join(DIST, "usage/index.html"));
    expect(usage).toContain("/plugin marketplace add jmchilton/bio-topo-foundry");
    expect(usage).toContain("codex plugin marketplace add jmchilton/bio-topo-foundry");
    expect(usage).toContain(
      'href="/bio-topo-foundry/usage/claude/score-docking-poses/"',
    );

    const skill = read(
      path.join(DIST, "usage/claude/score-docking-poses/index.html"),
    );
    expect(skill).toContain("Packaged runtime material");
    expect(skill).toContain("references/environments/pixi.toml");
    expect(skill).toContain("Provenance schema");
    expect(skill).toContain("SKILL.md");
  });
});
