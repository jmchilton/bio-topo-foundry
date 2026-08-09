import path from "node:path";

import type { Corpus } from "@galaxy-foundry/cast/command";

import { createFoundryContentReader } from "./content-reader";

/**
 * Project the caster's two source maps from the same collection walk and alias policy as the site.
 */
export function readCastCorpus(repoRoot: string): Corpus {
  const reader = createFoundryContentReader((relativePath) =>
    path.join(repoRoot, "content", relativePath),
  );
  const index = reader.contentIndex();
  const sourcePath = (file: string) => path.posix.join("content", file);

  return {
    slugMap: new Map(
      [...index.notesByAddress].map(([address, note]) => [
        address,
        sourcePath(note.file),
      ]),
    ),
    metaByPath: new Map(
      index.notes.map((note) => [sourcePath(note.file), note.meta ?? {}]),
    ),
  };
}
