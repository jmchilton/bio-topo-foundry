import fs from "node:fs";
import path from "node:path";

import yaml from "js-yaml";
import { describe, expect, it } from "vitest";

import { recipeSchema } from "../src/lib/frontmatter-schema";
import { readFrontmatter } from "./frontmatter";

/** Where the builds actually live: repo root, not under `content/`. */
const RECIPES_DIR = path.resolve("../recipes");
const NOTES_DIR = path.resolve("../content/recipes");

const recipeDirectories = () =>
  fs
    .readdirSync(RECIPES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) =>
      fs.existsSync(path.join(RECIPES_DIR, name, "recipe.yaml")),
    )
    .sort();

const noteSlugs = () =>
  fs
    .readdirSync(NOTES_DIR)
    .filter((name) => name.endsWith(".md"))
    .map((name) => name.replace(/\.md$/, ""))
    .sort();

interface RecipeFile {
  about?: { license?: string };
}

const recipeFile = (slug: string): RecipeFile =>
  yaml.load(
    fs.readFileSync(path.join(RECIPES_DIR, slug, "recipe.yaml"), "utf8"),
  ) as RecipeFile;

const noteData = (slug: string) => {
  const result = recipeSchema.safeParse(
    readFrontmatter(path.join(NOTES_DIR, `${slug}.md`)),
  );
  if (!result.success) throw new Error(`${slug}: ${result.error.message}`);
  return result.data;
};

const validRecipe = {
  type: "recipe",
  title: "phat",
  summary:
    "PHAT's persistent-homology matrix reduction, built here because no conda channel carries it.",
  gap: "absent",
  build: { status: "verified", platforms: ["linux-64"] },
  upstreaming: "eligible",
  tags: ["method/persistent-homology"],
};

const parses = (recipe: Record<string, unknown>) =>
  recipeSchema.safeParse(recipe).success;

const messages = (recipe: Record<string, unknown>) => {
  const result = recipeSchema.safeParse(recipe);
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
};

describe("recipe kind", () => {
  it("validates its executable example and every recipe note in the corpus", () => {
    const files = [
      path.resolve("src/types/recipe/example.md"),
      ...noteSlugs().map((slug) => path.join(NOTES_DIR, `${slug}.md`)),
    ];
    for (const file of files) {
      expect(recipeSchema.safeParse(readFrontmatter(file)).success, file).toBe(
        true,
      );
    }
  });

  /**
   * What a companion declaration would have bought if the recipe files lived beside the note. They
   * do not — a dozen fixture manifests reach them at `../../../recipes/<slug>` — so the
   * correspondence is checked here instead, in both directions: an unrecorded build and a note
   * pointing at nothing are the same defect from opposite ends.
   */
  it("has exactly one note per recipe directory, and no note without one", () => {
    expect(noteSlugs()).toEqual(recipeDirectories());
    expect(recipeDirectories().length).toBeGreaterThan(0);
  });

  /**
   * A `LicenseRef-` id is by construction not an SPDX licence, and conda-forge and Bioconda both
   * require a bundled OSI one. So the recipe file decides this field, and a note cannot promise a
   * route that the licence forecloses — nor keep claiming a block after upstream grants a licence.
   */
  it("blocks upstreaming exactly when the recipe declares no SPDX licence", () => {
    for (const slug of recipeDirectories()) {
      const license = recipeFile(slug).about?.license;
      expect(license, `${slug}: recipe.yaml declares no license`).toBeTruthy();
      expect(noteData(slug).upstreaming === "blocked", slug).toBe(
        license!.startsWith("LicenseRef-"),
      );
    }
  });

  it("requires a submission link from a recipe that claims to have left", () => {
    expect(parses(validRecipe)).toBe(true);
    for (const upstreaming of ["submitted", "published"]) {
      expect(messages({ ...validRecipe, upstreaming })).toContain(
        `\`upstreaming: ${upstreaming}\` must link the submission it claims`,
      );
      expect(
        parses({
          ...validRecipe,
          upstreaming,
          submission: "https://github.com/conda-forge/staged-recipes/pull/1",
        }),
      ).toBe(true);
    }
  });

  it("refuses a submission link from a recipe that has not left", () => {
    expect(
      messages({
        ...validRecipe,
        submission: "https://github.com/conda-forge/staged-recipes/pull/1",
      }),
    ).toContain(
      "a submission link belongs only to a recipe that has been submitted or published",
    );
  });

  it("requires a verified build to say where it was verified", () => {
    expect(parses({ ...validRecipe, build: { status: "verified" } })).toBe(
      false,
    );
    expect(
      parses({ ...validRecipe, build: { status: "verified", platforms: [] } }),
    ).toBe(false);
    expect(parses({ ...validRecipe, build: { status: "unverified" } })).toBe(
      true,
    );
    // The reverse: an unbuilt recipe cannot smuggle in a platform it never ran on.
    expect(
      parses({
        ...validRecipe,
        build: { status: "unverified", platforms: ["linux-64"] },
      }),
    ).toBe(false);
  });
});
