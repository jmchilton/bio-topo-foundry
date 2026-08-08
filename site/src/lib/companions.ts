import fs from "node:fs";

import {
  checkCompanions,
  companionsOf,
  type CompanionCheck,
  type NormalizedCompanion,
} from "@galaxy-foundry/kind-schema";
import { kindOf } from "@galaxy-foundry/kind-schema/collections";

import { DEFINITIONS } from "../types";
import { COLLECTIONS, contentPath } from "./frontmatter-schema";

export interface CompanionState {
  companion: NormalizedCompanion;
  present: boolean;
}

const directoryEntries = (relativeDirectory: string) =>
  fs
    .readdirSync(contentPath(relativeDirectory), { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith("."))
    .map((entry) => ({
      name: entry.name,
      directory: entry.isDirectory(),
      note:
        kindOf(COLLECTIONS, `${relativeDirectory}/${entry.name}`) !== undefined,
    }));

const environmentDirectory = (id: string) =>
  `${COLLECTIONS.environments.base}/${id}`;

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
