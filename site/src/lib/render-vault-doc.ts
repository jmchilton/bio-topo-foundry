import fs from "node:fs";

import { addBoldTermAnchors } from "@galaxy-foundry/wiki-links";
import { marked } from "marked";

import { contentReader } from "./content-reader";

export function renderVaultDoc(absolutePath: string, base: string): string {
  const source = fs.readFileSync(absolutePath, "utf8");
  const resolved = contentReader.resolveMarkdown(source, { base });
  return addBoldTermAnchors(marked.parse(resolved, { async: false }) as string);
}
