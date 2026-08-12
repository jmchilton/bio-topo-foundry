import path from "node:path";

import {
  loadLicenseFiles,
  redistributesUnder,
  type LicenseFile,
  type LicenseFileDeclaration,
} from "@galaxy-foundry/license-policy";

import { contentReader } from "./content-reader";
import { base } from "./site-base";

/**
 * The vendored copies live at the repository root, not under `content/`.
 *
 * They are not knowledge and they are not authored here — they are the terms a redistribution is
 * made under, and [[repository-layout]] puts them beside `LICENSE` for that reason. Resolved
 * absolutely because the callers are Astro pages whose cwd is `site/`.
 */
export const LICENSE_DIRECTORY = path.resolve("../LICENSES");

export interface LicenseCarrier {
  /** The note's path under `content/`, which is what a finding quotes back. */
  source: string;
  title: string;
  url: string;
}

export interface VendoredLicense {
  file: LicenseFile;
  carriers: LicenseCarrier[];
}

/** A note's `license_file` as a string, or `undefined` — frontmatter arrives untyped here. */
function declaredCopy(meta: Record<string, unknown> | undefined): string | undefined {
  const declared = meta?.license_file;
  return typeof declared === "string" && declared.length > 0 ? declared : undefined;
}

/** `name` for the kinds that carry one, `title` for the rest — the same pair the tag pages use. */
function displayName(meta: Record<string, unknown> | undefined): string | undefined {
  for (const key of ["name", "title"]) {
    const value = meta?.[key];
    if (typeof value === "string" && value.length > 0) return value;
  }
  return undefined;
}

/**
 * Every note's `license_file`, present or absent, as the audit's input.
 *
 * Absent is included rather than filtered: the audit decides that a note carrying nothing is not a
 * finding, and handing it only the declarations that carry would make that decision here instead.
 */
export function licenseDeclarations(): LicenseFileDeclaration[] {
  return contentReader.contentIndex().notes.map((note) => ({
    source: note.file,
    ...(declaredCopy(note.meta) ? { licenseFile: declaredCopy(note.meta) } : {}),
  }));
}

/** Each vendored copy with the notes that redistribute under it, filename-sorted. */
export function vendoredLicenses(): VendoredLicense[] {
  const notes = contentReader.contentIndex().notes;

  return loadLicenseFiles(LICENSE_DIRECTORY).map((file) => ({
    file,
    carriers: notes
      .filter((note) => redistributesUnder(declaredCopy(note.meta), file.id))
      .map((note) => ({
        source: note.file,
        title: displayName(note.meta) ?? note.id,
        url: `${base}/${note.target.path}/`,
      }))
      .sort((a, b) => a.title.localeCompare(b.title)),
  }));
}
