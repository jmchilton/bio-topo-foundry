import { readFileSync } from "node:fs";
import path from "node:path";

import { unified } from "@astrojs/markdown-remark";
import { describe, expect, it } from "vitest";

import remarkCitationLinks from "../src/lib/remark-citation-links";

/**
 * Rendered through the same processor factory the site configures, so the grammar under test is
 * the one readers get rather than a second parser that agrees with it today.
 */
const render = async (markdown: string): Promise<string> => {
  const renderer = await unified({
    remarkPlugins: [remarkCitationLinks],
  }).createRenderer({});
  return (await renderer.render(markdown)).code;
};

const REFERENCES = `
## References

1. First work.
2. Second work.
3. Third work.
`;

describe("citation markers", () => {
  it("links every written number and anchors every entry", async () => {
    const html = await render(`Claim [1, 3].${REFERENCES}`);

    expect(html).toContain(
      '<sup class="citation-marker">[<a href="#citation-1">1</a>, <a href="#citation-3">3</a>]</sup>',
    );
    expect(html).toContain('<li id="citation-1">');
    expect(html).toContain('<li id="citation-3">');
  });

  it("links a range at its written ends and drops the space before a marker", async () => {
    const html = await render(`Claim [1–3].${REFERENCES}`);

    expect(html).toContain(
      'Claim<sup class="citation-marker">[<a href="#citation-1">1</a>–<a href="#citation-3">3</a>]</sup>.',
    );
    // The interior entry is required to exist but is not invented as displayed text.
    expect(html).not.toContain(">2</a>");
  });

  it("refuses to build a marker naming an entry the list does not hold", async () => {
    await expect(render(`Claim [4].${REFERENCES}`)).rejects.toThrow(
      /citation \[4\] names an entry the reference list does not hold \(entries 1–3\)/u,
    );
    // A range is checked across its interior, not only at the ends it writes.
    await expect(render(`Claim [1–4].${REFERENCES}`)).rejects.toThrow(
      /citation \[1–4\]/u,
    );
  });

  it("leaves a bracketed number that is not prose alone", async () => {
    const html = await render(
      `Syntax \`[1]\` and a [1](https://example.org/) label.\n${REFERENCES}`,
    );

    expect(html).toContain("<code>[1]</code>");
    expect(html).toContain('<a href="https://example.org/">1</a>');
    expect(html).not.toContain("citation-marker");
  });

  it("passes over a reference heading that opens no numbered list", async () => {
    const html = await render(
      `Claim [2].\n\n## Typed references\n\nProse about a frontmatter field.\n${REFERENCES}`,
    );

    expect(html).toContain('<a href="#citation-2">2</a>');
    expect(html).toContain('<li id="citation-2">');
  });

  it("is inert on a note with no bibliography", async () => {
    const html = await render("Plain prose with no citations.\n");

    expect(html).toContain("<p>Plain prose with no citations.</p>");
    expect(html).not.toContain("citation-marker");
  });

  it("renders the corpus note that carries markers", async () => {
    const note = readFileSync(
      path.resolve("../content/applications/protein-flexibility.md"),
      "utf8",
    ).replace(/^---\n[\s\S]*?\n---\n/u, "");
    const html = await render(note);

    expect(html).toContain('<a href="#citation-7">7</a>–<a href="#citation-9">9</a>');
    expect(html).toContain('<li id="citation-13">');
    // Bibliography entries hold bracketed link labels — `[DOI]`, `[arXiv:…]` — and are not markers.
    expect(html).not.toContain('<sup class="citation-marker">[<a href="#citation-1">1</a>]</sup>DOI');
  });
});
