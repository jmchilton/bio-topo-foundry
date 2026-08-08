import fs from "node:fs";

import {
  checkCompanions,
  companionsOf,
  NOTE_FILE,
  type CompanionCheck,
  type NormalizedCompanion,
} from "@galaxy-foundry/kind-schema";

import { DEFINITIONS } from "../types";
import { COLLECTIONS, contentPath } from "./frontmatter-schema";

export interface CompanionState {
  companion: NormalizedCompanion;
  present: boolean;
}

const directoryEntries = (directory: string) =>
  fs.readdirSync(directory, { withFileTypes: true }).map((entry) => ({
    name: entry.name,
    directory: entry.isDirectory(),
    // Filenames cannot distinguish a note from a companion, so the caller says which is which.
    note: entry.name === NOTE_FILE,
  }));

const environmentDirectory = (id: string) =>
  contentPath(`${COLLECTIONS.environments.base}/${id}`);

/**
 * What a fixture's directory actually holds, measured rather than declared.
 *
 * `pixi.lock` is a recommended companion, so eight fixtures legitimately lack one. Reading that
 * from the directory means a note can never claim a lock it does not have — the reason the kind
 * has no `locked` field.
 */
export function environmentCompanions(id: string): CompanionState[] {
  const present = new Set(
    directoryEntries(environmentDirectory(id)).map((entry) => entry.name),
  );
  return [...companionsOf(DEFINITIONS.environment).values()].map(
    (companion) => ({ companion, present: present.has(companion.name) }),
  );
}

/** The shared companion check over one fixture directory, for tests and build-time validation. */
export function environmentCompanionCheck(id: string): CompanionCheck {
  return checkCompanions(
    directoryEntries(environmentDirectory(id)),
    DEFINITIONS.environment,
  );
}
