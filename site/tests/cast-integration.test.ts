import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import {
  bundleDir,
  loadTargetConfig,
  readMarkdown,
  type Provenance,
} from "@galaxy-foundry/cast";
import { describe, expect, it } from "vitest";

import { readCastCorpus } from "../src/lib/cast-corpus";
import { contentReader } from "../src/lib/content-reader";
import { DEFAULT_CAST_TARGET } from "../src/lib/cast-spec";
import { DEFINITIONS } from "../src/types";

const repoRoot = path.resolve("..");
const targetDir = path.join(repoRoot, "casts", DEFAULT_CAST_TARGET);

const committedBundles = () =>
  contentReader
    .noteIds("molds")
    .map((mold) => ({ mold, root: bundleDir(targetDir, mold) }))
    .filter(({ root }) => existsSync(path.join(root, "_provenance.json")));

describe("the cast binding", () => {
  it("projects the site's aliases and frontmatter into the caster corpus", () => {
    const corpus = readCastCorpus(repoRoot);
    const source = corpus.slugMap.get("open-topoqa-scorer-environment");

    expect(source).toBe("content/environments/open-topoqa-scorer/index.md");
    expect(corpus.metaByPath.get(source!)).toMatchObject({
      type: "environment",
      summary: expect.any(String),
    });
  });

  it("keeps every committed bundle inside its target and Kind contracts", () => {
    const target = loadTargetConfig(targetDir);
    const bundles = committedBundles();
    expect(
      bundles.length,
      "the cast check found no committed bundles",
    ).toBeGreaterThan(0);

    for (const { mold, root } of bundles) {
      const provenance = JSON.parse(
        readFileSync(path.join(root, "_provenance.json"), "utf8"),
      ) as Provenance;
      const documentPath = path.join(root, target.document.path);
      const document = readMarkdown(documentPath);

      expect(provenance.mold.name).toBe(mold);
      for (const output of target.required_outputs) {
        expect(
          existsSync(path.join(root, output)),
          `${mold}: missing ${output}`,
        ).toBe(true);
      }
      for (const ref of provenance.refs) {
        expect(
          existsSync(path.join(root, ref.dst)),
          `${mold}: missing ${ref.dst}`,
        ).toBe(true);
      }
      for (const field of target.skill_constraints.frontmatter_required) {
        expect(
          document.meta[field],
          `${mold}: missing frontmatter ${field}`,
        ).toBeTruthy();
      }
      for (const forbidden of target.skill_constraints
        .forbidden_runtime_paths) {
        expect(
          document.body,
          `${mold}: contains runtime source path ${forbidden}`,
        ).not.toContain(forbidden);
      }
      expect(
        document.body.match(/^# /gm),
        `${mold}: generated more than one title`,
      ).toHaveLength(1);

      for (const primary of provenance.refs.filter(
        (ref) => !ref.companion_of,
      )) {
        const definition =
          DEFINITIONS[primary.kind as keyof typeof DEFINITIONS];
        const expected = (definition?.companions ?? [])
          .filter((companion) => companion.disposition === "bundled")
          .map((companion) =>
            path.posix.join(path.posix.dirname(primary.src), companion.file),
          )
          .filter((source) => existsSync(path.join(repoRoot, source)))
          .sort();
        const actual = provenance.refs
          .filter((ref) => ref.companion_of === primary.dst)
          .map((ref) => ref.src)
          .sort();

        expect(
          actual,
          `${mold}: bundled companions drifted for ${primary.src}`,
        ).toEqual(expected);
      }

      const foundryOnly = DEFINITIONS.mold.companions
        .filter((companion) => companion.disposition === "foundry-only")
        .map((companion) =>
          path.posix.join(
            path.posix.dirname(provenance.mold.path),
            companion.file,
          ),
        );
      expect(provenance.refs.map((ref) => ref.src)).not.toEqual(
        expect.arrayContaining(foundryOnly),
      );
    }
  });
});
