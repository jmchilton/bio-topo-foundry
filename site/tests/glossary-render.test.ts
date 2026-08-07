import path from "node:path";
import { describe, expect, it } from "vitest";

import { renderVaultDoc } from "../src/lib/render-vault-doc";

describe("glossary reader", () => {
  it("uses the shared wiki-link grammar without corrupting syntax examples", () => {
    const html = renderVaultDoc(
      path.resolve("../content/meta/glossary.md"),
      "/bio-topo-foundry",
    );

    expect(html).toContain('<p id="package"><strong>Package</strong>');
    expect(html).toContain("<code>[[Target]]</code>");
    expect(html).not.toContain("<code><strong>Target</strong></code>");
  });
});
