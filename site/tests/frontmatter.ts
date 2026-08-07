import fs from "node:fs";
import yaml from "js-yaml";

export function readFrontmatter(file: string): unknown {
  const text = fs.readFileSync(file, "utf8");
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error(`${file}: missing YAML frontmatter block`);
  const data = yaml.load(match[1]);
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error(`${file}: frontmatter must be a mapping`);
  }
  return data;
}
