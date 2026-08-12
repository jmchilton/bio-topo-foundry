import { readFile } from "node:fs/promises";
import path from "node:path";

import { parse as parseToml } from "smol-toml";

import { isMissingFile } from "../base/files";

/**
 * Read the runtime authority for one fixture: what the manifest declares and what the lock
 * actually resolved.
 *
 * Nothing here solves, fetches, or executes. The lock is the record of a solve that already
 * happened, so every claim it answers is answerable offline and identically on every machine.
 */

/** A package as the lock records it, keyed by the channel it was actually taken from. */
export interface LockedPackage {
  name: string;
  version: string;
  build: string;
  channel: string;
  subdir: string;
}

export interface PixiEvidence {
  /** Fixture directory name, which is also the environment note's id. */
  environment: string;
  /** Channels the manifest lists, in priority order. */
  declaredChannels: string[];
  /** Platforms the manifest asks to solve for. */
  declaredPlatforms: string[];
  /** Top-level `[dependencies]` keys — the packages the fixture is *about*, not its closure. */
  declaredDependencies: string[];
  /** Dependencies satisfied by an in-repo recipe rather than a channel. */
  pathDependencies: string[];
  /** Platforms the lock actually solved. `undefined` when there is no lock. */
  lockedPlatforms?: string[];
  /** Every package in the solved closure, first occurrence wins. `undefined` when there is no lock. */
  lockedPackages?: Map<string, LockedPackage>;
}

/**
 * Lock entries appear as full channel URLs. Both archive formats occur in this corpus — the
 * newer `.conda` and the older `.tar.bz2` — and a reader that knows only one silently loses
 * whole fixtures rather than failing, which is the worst way to be wrong.
 */
const LOCK_ENTRY =
  /conda\.anaconda\.org\/([a-z0-9._-]+)\/([a-z0-9_-]+)\/(.+?)-([^-]+)-([^-]+)\.(?:conda|tar\.bz2)/gu;

const LOCK_PLATFORM = /^\s*-\s+name:\s+([a-z0-9-]+)\s*$/gmu;

/** Canonical package name. Conda treats `_` and `-` as distinct; note prose does not. */
export const canonicalPackageName = (name: string): string => name.toLowerCase().replace(/_/gu, "-");

export async function readPixiEvidence(
  environmentDirectory: string,
  environment: string,
): Promise<PixiEvidence> {
  const manifest = parseToml(
    await readFile(path.join(environmentDirectory, "pixi.toml"), "utf8"),
  ) as PixiManifest;

  const dependencies = manifest.dependencies ?? {};
  const declaredDependencies = Object.keys(dependencies).sort();
  const pathDependencies = declaredDependencies.filter((name) => {
    const spec = dependencies[name];
    return typeof spec === "object" && spec !== null && "path" in spec;
  });

  const evidence: PixiEvidence = {
    environment,
    declaredChannels: manifest.workspace?.channels ?? [],
    declaredPlatforms: manifest.workspace?.platforms ?? [],
    declaredDependencies,
    pathDependencies,
  };

  const lock = await readOptional(path.join(environmentDirectory, "pixi.lock"));
  if (lock === undefined) return evidence;

  const lockedPackages = new Map<string, LockedPackage>();
  for (const [, channel, subdir, name, version, build] of lock.matchAll(LOCK_ENTRY)) {
    const key = canonicalPackageName(name as string);
    // First occurrence wins: a lock repeats an entry once per environment that uses it, and the
    // repetitions are the same artifact.
    if (!lockedPackages.has(key)) {
      lockedPackages.set(key, {
        name: name as string,
        version: version as string,
        build: build as string,
        channel: channel as string,
        subdir: subdir as string,
      });
    }
  }

  return {
    ...evidence,
    lockedPlatforms: [...new Set([...lock.matchAll(LOCK_PLATFORM)].map(([, name]) => name as string))],
    lockedPackages,
  };
}

interface PixiManifest {
  workspace?: { channels?: string[]; platforms?: string[] };
  dependencies?: Record<string, unknown>;
}

async function readOptional(pathname: string): Promise<string | undefined> {
  try {
    return await readFile(pathname, "utf8");
  } catch (error) {
    if (isMissingFile(error)) return undefined;
    throw error;
  }
}
