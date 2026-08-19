import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * Link a note's numbered citation markers to its own bibliography.
 *
 * A marker like `[7–9]` is prose, not Markdown: nothing in the pipeline connects it to the ordered
 * list under `## References`, and a Markdown list item carries no id to connect it to. This plugin
 * supplies both halves — an id per entry, a link per written number — so the corpus keeps writing
 * plain numbered prose and the reader still gets to jump.
 *
 * A marker naming no entry is a build failure, matching the `[[Target]]` invariant: a citation
 * either resolves or the site does not build. The other direction — an entry nothing cites — is
 * already owned by the citation audit's uncited-entry ledger, and is not re-checked here.
 *
 * Not typed against `@types/mdast`, which is not a dependency of this site. The shapes below are
 * the parts of the tree this plugin reads.
 */

interface MdastNode {
  type: string;
  value?: string;
  depth?: number;
  ordered?: boolean;
  start?: number | null;
  url?: string;
  title?: string | null;
  children?: MdastNode[];
  data?: { hName?: string; hProperties?: Record<string, unknown> };
}

/**
 * The heading vocabulary is the citation audit's, read from its config rather than restated.
 *
 * Two lists of what counts as a bibliography would agree until one of them was edited, and the
 * disagreement is silent in both directions: a heading the audit reads and this plugin does not
 * leaves every marker in the note unresolvable, and the reverse anchors entries nothing audits.
 */
const AUDIT_CONFIG = "audit-citations.config.json";

/**
 * Found by walking up from the working directory rather than from this module.
 *
 * A module-relative `import.meta.url` is not a filesystem path everywhere this plugin runs: Vite
 * hands it out as a `/@fs/…` URL, which resolves to a path that does not exist. The working
 * directory is `site/` for the build and the tests, and the repository root for anyone running a
 * command from there — both reach the config by walking up.
 */
const auditConfigPath = (): string => {
  let directory = process.cwd();
  for (;;) {
    const candidate = path.join(directory, AUDIT_CONFIG);
    if (existsSync(candidate)) return candidate;
    const parent = path.dirname(directory);
    if (parent === directory) {
      throw new Error(
        `No ${AUDIT_CONFIG} above ${process.cwd()}; citation markers cannot be resolved.`,
      );
    }
    directory = parent;
  }
};

const referenceHeadingPattern = (): RegExp => {
  const config = JSON.parse(readFileSync(auditConfigPath(), "utf8")) as {
    referenceHeadingTerms?: readonly string[];
  };
  const terms = config.referenceHeadingTerms ?? [];
  if (terms.length === 0) {
    throw new Error(
      `${AUDIT_CONFIG} declares no referenceHeadingTerms; citation markers cannot be resolved.`,
    );
  }
  return new RegExp(
    terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")).join("|"),
    "iu",
  );
};

/** `[3]`, `[1, 2]`, `[7–9]` — bracketed numbers separated by commas or a dash of any width. */
const MARKER = /\[(\d+(?:\s*[,–—-]\s*\d+)*)\]/gu;
const SEPARATOR = /(\s*[,–—-]\s*)/u;
const RANGE_SEPARATOR = /[–—-]/u;

/** A link's children are its label; rewriting inside one would nest a link in a link. */
const OPAQUE = new Set([
  "code",
  "definition",
  "html",
  "inlineCode",
  "link",
  "linkReference",
]);

const textOf = (node: MdastNode): string =>
  node.type === "text" || node.type === "inlineCode"
    ? (node.value ?? "")
    : (node.children ?? []).map(textOf).join("");

interface Bibliography {
  list: MdastNode;
  entries: Set<number>;
  first: number;
  last: number;
}

/**
 * The first ordered list under a reference heading, before that section ends.
 *
 * Bounded by the next heading at the same level or above, so a note whose bibliography is followed
 * by another section cannot annex that section's first list. The heading rule is a substring match
 * and matches more than bibliographies — `## Typed references` in a design record is prose about
 * a frontmatter field — so a matching section holding no numbered list yields to the next one
 * rather than deciding the note has no bibliography.
 */
function findBibliography(tree: MdastNode, heading: RegExp): Bibliography | null {
  const blocks = tree.children ?? [];

  for (const [index, block] of blocks.entries()) {
    if (block.type !== "heading" || !heading.test(textOf(block))) continue;
    const depth = block.depth ?? 2;

    for (const node of blocks.slice(index + 1)) {
      if (node.type === "heading" && (node.depth ?? 1) <= depth) break;
      if (node.type !== "list" || !node.ordered) continue;
      const items = node.children ?? [];
      const first = typeof node.start === "number" ? node.start : 1;
      const entries = new Set(items.map((_item, position) => first + position));
      return { list: node, entries, first, last: first + items.length - 1 };
    }
  }
  return null;
}

function anchorEntries(bibliography: Bibliography): void {
  const items = bibliography.list.children ?? [];
  items.forEach((item, index) => {
    item.data = {
      ...item.data,
      hProperties: {
        ...item.data?.hProperties,
        id: `citation-${bibliography.first + index}`,
      },
    };
  });
}

const linkTo = (number: string): MdastNode => ({
  type: "link",
  url: `#citation-${number}`,
  title: null,
  children: [{ type: "text", value: number }],
});

/**
 * One marker, superscripted, with each written number linked.
 *
 * A range links the two numbers the author wrote rather than expanding to the entries it implies:
 * the displayed text stays the text in the note. The brackets stay too — a bare superscript `11, 12`
 * after a table cell reading `0.43` invites the reader to attach the digits to the number.
 */
function markerNode(inner: string): MdastNode {
  const children: MdastNode[] = [{ type: "text", value: "[" }];
  for (const token of inner.split(SEPARATOR)) {
    if (token === "") continue;
    children.push(
      /^\d+$/u.test(token) ? linkTo(token) : { type: "text", value: token },
    );
  }
  children.push({ type: "text", value: "]" });
  return {
    type: "citationMarker",
    data: { hName: "sup", hProperties: { className: ["citation-marker"] } },
    children,
  };
}

/** Every entry a marker names, including the interior of a range it only writes the ends of. */
function cited(inner: string): number[] {
  const tokens = inner.split(SEPARATOR).filter((token) => token !== "");
  const numbers: number[] = [];
  tokens.forEach((token, index) => {
    if (!/^\d+$/u.test(token)) return;
    const value = Number(token);
    const separator = tokens[index - 1];
    const previous = Number(tokens[index - 2]);
    if (separator && RANGE_SEPARATOR.test(separator) && previous < value) {
      for (let interior = previous + 1; interior < value; interior += 1) {
        numbers.push(interior);
      }
    }
    numbers.push(value);
  });
  return numbers;
}

/**
 * Split one text node on its markers, dropping the space that precedes each.
 *
 * The space is deliberate: source prose writes `measurements [1, 2].`, and a superscript set off by
 * a word space reads as a separate token rather than as an annotation on the word it follows.
 */
function splitText(
  text: string,
  onUnresolved: (marker: string) => void,
  entries: Set<number>,
): MdastNode[] | null {
  const pattern = new RegExp(MARKER.source, "gu");
  const nodes: MdastNode[] = [];
  let consumed = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    const inner = match[1];
    if (inner === undefined) continue;
    const unresolved = cited(inner).filter((number) => !entries.has(number));
    if (unresolved.length > 0) {
      onUnresolved(match[0]);
      continue;
    }
    const preceding = text.slice(consumed, match.index).replace(/[ \t\n]+$/u, "");
    if (preceding !== "") nodes.push({ type: "text", value: preceding });
    nodes.push(markerNode(inner));
    consumed = match.index + match[0].length;
  }

  if (nodes.length === 0) return null;
  if (consumed < text.length) {
    nodes.push({ type: "text", value: text.slice(consumed) });
  }
  return nodes;
}

export default function remarkCitationLinks() {
  const heading = referenceHeadingPattern();

  /**
   * Typed at the boundary as `unknown`: the real mdast types come from `@types/mdast`, which this
   * site does not depend on, and a structural restatement of them cannot stay assignable to the
   * transformer signature as those types evolve. The shapes this plugin reads are asserted once,
   * here, and every use below is against {@link MdastNode}.
   */
  return (tree: unknown, file?: unknown) => {
    const root = tree as MdastNode;
    const notePath = (file as { path?: string } | undefined)?.path;
    const bibliography = findBibliography(root, heading);
    const entries = bibliography?.entries ?? new Set<number>();
    const unresolved: string[] = [];

    const visit = (node: MdastNode): void => {
      const children = node.children;
      if (!children) return;
      const rewritten: MdastNode[] = [];
      for (const child of children) {
        if (child.type === "text" && child.value?.includes("[")) {
          const split = splitText(
            child.value,
            (marker) => unresolved.push(marker),
            entries,
          );
          rewritten.push(...(split ?? [child]));
          continue;
        }
        if (!OPAQUE.has(child.type)) visit(child);
        rewritten.push(child);
      }
      node.children = rewritten;
    };

    for (const block of root.children ?? []) {
      if (block !== bibliography?.list) visit(block);
    }

    if (unresolved.length > 0) {
      const where = notePath ?? "a note";
      const known = bibliography
        ? `entries ${bibliography.first}–${bibliography.last}`
        : "no numbered bibliography";
      throw new Error(
        `${where}: citation ${unresolved.join(", ")} names an entry the reference list does not hold (${known}).`,
      );
    }

    if (bibliography) anchorEntries(bibliography);
  };
}
