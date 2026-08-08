import fs from "node:fs";
import yaml from "js-yaml";

export interface MarkdownNote {
  body: string;
  frontmatter: unknown;
}

export function readMarkdownNote(file: string): MarkdownNote {
  const text = fs.readFileSync(file, "utf8");
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error(`${file}: missing YAML frontmatter block`);
  const data = yaml.load(match[1]);
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error(`${file}: frontmatter must be a mapping`);
  }
  return { body: text.slice(match[0].length), frontmatter: data };
}

export function readFrontmatter(file: string): unknown {
  return readMarkdownNote(file).frontmatter;
}
