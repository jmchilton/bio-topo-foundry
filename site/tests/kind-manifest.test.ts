import { describe, expect, it } from "vitest";
import {
  KIND_MANIFEST_VERSION,
  parseKindManifest,
} from "@galaxy-foundry/kind-manifest";

import {
  KIND_MANIFEST_INSTANCE,
  KIND_MANIFEST_SOURCE,
  buildKindManifest,
} from "../src/lib/kind-manifest";
import { KINDS } from "../src/types";

const manifest = buildKindManifest();
const kindNamed = (name: string) =>
  manifest.kinds.find((entry) => entry.kind === name)!;

describe("this Foundry's kind manifest", () => {
  it("names every declared kind in barrel order", () => {
    expect(manifest.kinds.map(({ kind }) => kind)).toEqual(
      KINDS.map(({ kind }) => kind),
    );
  });

  it("stamps the shared format version and producer-owned source", () => {
    expect(manifest.instance).toBe(KIND_MANIFEST_INSTANCE);
    expect(manifest.version).toBe(KIND_MANIFEST_VERSION);
    expect(manifest.source).toEqual(KIND_MANIFEST_SOURCE);
  });

  it("derives layout and locations from the kind and collection table", () => {
    expect(kindNamed("package")).toMatchObject({
      kind: "package",
      shape: "file",
      companions: [],
      locations: ["packages"],
    });
  });

  /**
   * The directory-shaped kind is where `shape` and `companions` stop being defaults. A consumer
   * reading `companions: []` on every kind cannot tell an empty set from an unmodelled one.
   */
  it("carries the directory shape and declared companions of a fixture kind", () => {
    expect(kindNamed("environment")).toMatchObject({
      kind: "environment",
      shape: "directory",
      locations: ["environments"],
    });
    expect(
      kindNamed("environment").companions.map(({ file, requirement }) => [
        file,
        requirement,
      ]),
    ).toEqual([
      ["pixi.toml", "required"],
      ["pixi.lock", "recommended"],
    ]);
  });

  it("derives a correctly discriminated frontmatter field table", () => {
    const packageKind = kindNamed("package");
    const type = packageKind.fields.find(({ name }) => name === "type");
    expect(type).toEqual({ name: "type", required: true, type: '"package"' });
    expect(packageKind.fields.length).toBeGreaterThan(1);
  });

  it("carries caller-read docs and worked examples", () => {
    const withContent = buildKindManifest({
      docs: { package: "# Package\n\nContract." },
      examples: { package: "---\ntype: package\n---" },
    });
    const packageKind = withContent.kinds.find(
      (entry) => entry.kind === "package",
    );
    expect(packageKind?.doc).toBe("# Package\n\nContract.");
    expect(packageKind?.example).toBe("---\ntype: package\n---");
  });

  it("is deterministic and accepted by the shared reader", () => {
    expect(JSON.stringify(buildKindManifest())).toBe(JSON.stringify(manifest));
    expect(parseKindManifest(JSON.parse(JSON.stringify(manifest)))).toEqual(
      manifest,
    );
  });
});
