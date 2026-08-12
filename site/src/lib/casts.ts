import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import {
  bundleDir,
  loadTargetConfig,
  readMarkdown,
  type Provenance,
  type ProvenanceRefEntry,
} from "@galaxy-foundry/cast";

export interface CastArtifact {
  target: string;
  moldSlug: string;
  dir: string;
  hasSkill: boolean;
  name?: string;
  description?: string;
}

export interface CastAttachedFile extends ProvenanceRefEntry {
  absPath: string | null;
  exists: boolean;
  sizeBytes: number | null;
  anchor: string;
}

export interface SkillBundle extends CastArtifact {
  skillPath: string;
  provenance: Provenance | null;
  attachedFiles: CastAttachedFile[];
}

function targetNames(repoRoot: string): string[] {
  const castsRoot = path.join(repoRoot, "casts");
  if (!existsSync(castsRoot)) return [];
  return readdirSync(castsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .filter((name) => existsSync(path.join(castsRoot, name, "_target.yml")))
    .sort();
}

function skillMetadata(skillPath: string): Pick<CastArtifact, "name" | "description"> {
  if (!existsSync(skillPath)) return {};
  const meta = readMarkdown(skillPath).meta;
  return {
    ...(typeof meta.name === "string" ? { name: meta.name } : {}),
    ...(typeof meta.description === "string" ? { description: meta.description } : {}),
  };
}

function bundleParent(targetDir: string): string {
  return path.dirname(bundleDir(targetDir, "__foundry_bundle_probe__"));
}

function readProvenance(file: string): Provenance | null {
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, "utf8")) as Provenance;
  } catch {
    return null;
  }
}

function safeBundleFile(bundleRoot: string, relativePath: string): string | null {
  const absolute = path.resolve(bundleRoot, relativePath);
  const relative = path.relative(bundleRoot, absolute);
  return relative.startsWith("..") || path.isAbsolute(relative) ? null : absolute;
}

function anchorFor(relativePath: string): string {
  return `ref-${relativePath
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

function attachedFiles(bundleRoot: string, provenance: Provenance | null): CastAttachedFile[] {
  return (provenance?.refs ?? []).map((ref) => {
    const candidate = safeBundleFile(bundleRoot, ref.dst);
    const exists = candidate !== null && existsSync(candidate) && statSync(candidate).isFile();
    return {
      ...ref,
      absPath: exists ? candidate : null,
      exists,
      sizeBytes: exists && candidate ? statSync(candidate).size : null,
      anchor: anchorFor(ref.dst),
    };
  });
}

/** All committed cast bundles, discovered from target declarations rather than a target list. */
export function listAllCasts(repoRoot: string): CastArtifact[] {
  const casts: CastArtifact[] = [];
  for (const target of targetNames(repoRoot)) {
    const targetDir = path.join(repoRoot, "casts", target);
    const config = loadTargetConfig(targetDir);
    const parent = bundleParent(targetDir);
    if (!existsSync(parent)) continue;

    for (const entry of readdirSync(parent, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.startsWith(".") || entry.name.startsWith("_")) continue;
      const dir = bundleDir(targetDir, entry.name);
      const documentPath = path.join(dir, config.document.path);
      const hasSkill = config.document.path === "SKILL.md" && existsSync(documentPath);
      casts.push({
        target,
        moldSlug: entry.name,
        dir,
        hasSkill,
        ...skillMetadata(documentPath),
      });
    }
  }
  return casts.sort(
    (left, right) =>
      left.target.localeCompare(right.target) || left.moldSlug.localeCompare(right.moldSlug),
  );
}

export function listCastsForMold(
  moldSlug: string,
  repoRoot: string,
): CastArtifact[] {
  return listAllCasts(repoRoot).filter((cast) => cast.moldSlug === moldSlug);
}

export function loadSkillBundle(
  moldSlug: string,
  repoRoot: string,
): SkillBundle | null {
  const target = "claude";
  const targetDir = path.join(repoRoot, "casts", target);
  if (!existsSync(path.join(targetDir, "_target.yml"))) return null;
  const config = loadTargetConfig(targetDir);
  const dir = bundleDir(targetDir, moldSlug);
  const skillPath = path.join(dir, config.document.path);
  if (config.document.path !== "SKILL.md" || !existsSync(skillPath)) return null;
  const provenance = readProvenance(path.join(dir, "_provenance.json"));
  return {
    target,
    moldSlug,
    dir,
    hasSkill: true,
    ...skillMetadata(skillPath),
    skillPath,
    provenance,
    attachedFiles: attachedFiles(dir, provenance),
  };
}
