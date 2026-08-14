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
 * Lock entries appear as full artifact URLs. Both conda archive formats occur in this corpus — the
 * newer `.conda` and the older `.tar.bz2` — and a reader that knows only one silently loses whole
 * fixtures rather than failing, which is the worst way to be wrong.
 */
const CONDA_ENTRY =
  /conda\.anaconda\.org\/([a-z0-9._-]+)\/([a-z0-9_-]+)\/(.+?)-([^-]+)-([^-]+)\.(?:conda|tar\.bz2)/u;

/** A wheel URL: `.../<name>-<version>-<python tag>-<abi>-<platform>.whl`. */
const PYPI_WHEEL = /\/([A-Za-z0-9._-]+?)-([0-9][A-Za-z0-9._!+-]*?)-(?:py|cp|pp|ip|jy|abi|none)[^/]*\.whl$/u;

/** A source distribution: `.../<name>-<version>.tar.gz`, with no build tags to separate. */
const PYPI_SDIST = /\/([A-Za-z0-9._-]+?)-([0-9][A-Za-z0-9._!+]*)\.(?:tar\.gz|tar\.bz2|zip)$/u;

/** Every artifact line the lock records, whatever kind it is. */
const LOCK_ARTIFACT = /^\s*-\s+(conda|pypi):\s+(\S+)\s*$/gmu;

const LOCK_PLATFORM = /^\s*-\s+name:\s+([a-z0-9-]+)\s*$/gmu;

/**
 * A lock entry this reader could not decode.
 *
 * Skipping one is not a survivable error. An unread entry removes a package from the evidence, and
 * a claim about a package the evidence lacks reads as a claim the runtime contradicts — so a
 * parser gap does not degrade the audit, it makes it accuse a note of stating something true.
 */
export class UnreadableLockEntry extends Error {
  constructor(environment: string, entry: string) {
    super(
      `${environment}: cannot read the lock entry ${entry}. Teach the reader this artifact shape ` +
        `rather than letting the package drop out of the evidence, which would turn a correct ` +
        `claim about it into a finding.`,
    );
    this.name = "UnreadableLockEntry";
  }
}

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
  for (const [, kind, url] of lock.matchAll(LOCK_ARTIFACT)) {
    const locked = kind === "conda" ? readCondaEntry(url as string) : readPypiEntry(url as string);
    if (locked === undefined) throw new UnreadableLockEntry(environment, url as string);
    const key = canonicalPackageName(locked.name);
    // First occurrence wins: a lock repeats an entry once per environment that uses it, and the
    // repetitions are the same artifact. This corpus solves one platform per fixture; a fixture
    // that solved several could resolve one name to several versions, which this would flatten.
    if (!lockedPackages.has(key)) lockedPackages.set(key, locked);
  }

  return {
    ...evidence,
    lockedPlatforms: [...new Set([...lock.matchAll(LOCK_PLATFORM)].map(([, name]) => name as string))],
    lockedPackages,
  };
}

function readCondaEntry(url: string): LockedPackage | undefined {
  const match = CONDA_ENTRY.exec(url);
  if (match === null) return undefined;
  const [, channel, subdir, name, version, build] = match;
  return { name, version, build, channel, subdir };
}

/**
 * A PyPI wheel is a package the closure genuinely contains, so it belongs in the evidence — but
 * `pypi` is not a conda channel, and recording it as one would let a fixture that installs from
 * PyPI satisfy a claim about Bioconda.
 */
function readPypiEntry(url: string): LockedPackage | undefined {
  const match = PYPI_WHEEL.exec(url) ?? PYPI_SDIST.exec(url);
  if (match === null) return undefined;
  const [, name, version] = match;
  return { name, version, build: "", channel: "pypi", subdir: "" };
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
