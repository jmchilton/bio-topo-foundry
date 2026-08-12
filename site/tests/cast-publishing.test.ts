import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { readMarkdown } from "@galaxy-foundry/cast";
import { describe, expect, it } from "vitest";

import { listAllCasts, loadSkillBundle } from "../src/lib/casts";

const repoRoot = path.resolve("..");
const pluginRoot = path.join(repoRoot, "casts", "claude");

function readJson(relativePath: string): Record<string, any> {
  return JSON.parse(readFileSync(path.join(repoRoot, relativePath), "utf8"));
}

describe("published cast skills", () => {
  const claudePlugin = readJson("casts/claude/.claude-plugin/plugin.json");
  const codexPlugin = readJson("casts/claude/.codex-plugin/plugin.json");
  const claudeMarketplace = readJson(".claude-plugin/marketplace.json");
  const codexMarketplace = readJson(".agents/plugins/marketplace.json");

  it("points both runtime manifests at one generated skill tree", () => {
    expect(codexPlugin.name).toBe(claudePlugin.name);
    expect(codexPlugin.version).toBe(claudePlugin.version);
    expect(codexPlugin.skills).toBe("./skills/");
    expect(existsSync(path.join(pluginRoot, codexPlugin.skills))).toBe(true);
    expect(existsSync(path.join(repoRoot, "casts", "codex", "skills"))).toBe(
      false,
    );
  });

  it("publishes that plugin through both repository marketplaces", () => {
    const claudeEntry = claudeMarketplace.plugins.find(
      (entry: { name?: string }) => entry.name === claudePlugin.name,
    );
    const codexEntry = codexMarketplace.plugins.find(
      (entry: { name?: string }) => entry.name === codexPlugin.name,
    );

    expect(claudeMarketplace.name).toBe(codexMarketplace.name);
    expect(claudeEntry?.source).toBe("./casts/claude");
    expect(codexEntry?.source).toEqual({
      source: "local",
      path: "./casts/claude",
    });
    expect(codexEntry?.policy).toEqual({
      installation: "AVAILABLE",
      authentication: "ON_INSTALL",
    });
    expect(path.resolve(repoRoot, codexEntry.source.path)).toBe(pluginRoot);
  });

  it("discovers every committed target bundle and its packaged references", () => {
    const casts = listAllCasts(repoRoot);
    expect(casts, "the publishing surface found no committed casts").not.toEqual(
      [],
    );
    expect(casts.map((cast) => `${cast.target}:${cast.moldSlug}`)).toContain(
      "claude:score-docking-poses",
    );

    const bundle = loadSkillBundle("score-docking-poses", repoRoot);
    expect(bundle).not.toBeNull();
    expect(bundle?.attachedFiles).toHaveLength(3);
    expect(bundle?.attachedFiles.every((ref) => ref.exists)).toBe(true);
  });

  it("keeps every discovered skill directory portable and complete", () => {
    const failures: string[] = [];
    const skillsRoot = path.join(pluginRoot, "skills");
    for (const entry of readdirSync(skillsRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const skillPath = path.join(skillsRoot, entry.name, "SKILL.md");
      if (!existsSync(skillPath)) {
        failures.push(`${entry.name}: missing SKILL.md`);
        continue;
      }
      const keys = Object.keys(readMarkdown(skillPath).meta).sort();
      if (keys.join(",") !== "description,name") {
        failures.push(`${entry.name}: frontmatter ${keys.join(", ")}`);
      }
    }
    expect(failures).toEqual([]);
  });
});
