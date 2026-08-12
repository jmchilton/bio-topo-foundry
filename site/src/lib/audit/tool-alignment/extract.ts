import { claimId, sourceTextDigest, type ArtifactSpan } from "../base/claims";

/**
 * Read runtime claims out of note prose.
 *
 * This is the part that decides whether the audit is worth running. Every false positive is an
 * accusation aimed at a maintainer, and the audit ScientistOne reports is the warning: of twelve
 * flagged provenance failures only two to four were genuine, the rest extraction artifacts. So the
 * grammar here is deliberately narrow, each extractor carries a pre-filter, and everything the
 * pre-filter rejects is counted rather than discarded — a rate describes only what the extractor
 * could read, and one that does not say how much it read is a number nobody can size.
 */

export const toolClaimKinds = [
  "lock-platform",
  "package-channel",
  "dependency-count",
  "package-version",
] as const;

export type ToolClaimKind = (typeof toolClaimKinds)[number];

export interface ToolClaim {
  id: string;
  kind: ToolClaimKind;
  environment: string;
  /** The value the prose asserts, verbatim. */
  asserted: string;
  /** The package the claim is about, where the claim names one. */
  subject?: string;
  span: ArtifactSpan;
  /** The joined sentence, so a report can show the claim as written. */
  context: string;
}

/** A line carrying a token this extractor knows but declined to promote, and why. */
export interface ExtractionDiagnostic {
  artifactPath: string;
  line: number;
  reason: "build-subject" | "no-subject" | "unknown-package";
  text: string;
}

export interface ToolClaimScan {
  claims: ToolClaim[];
  diagnostics: ExtractionDiagnostic[];
}

const PLATFORM = /\b(?:linux-64|linux-aarch64|osx-arm64|osx-64|win-64|noarch)\b/gu;

/**
 * Word boundaries are load-bearing rather than stylistic: without them "unblocks" contains "lock",
 * and a sentence about unblocking a package reads as a claim about a lockfile. That was a real
 * false positive before these anchors existed.
 */
const LOCK_SUBJECT = /\b(?:lock|locked|locks|locking|lockfile|solved|solves|solve)\b/giu;
const BUILD_SUBJECT = /\b(?:recipe|recipes|build|builds|building|built|compiles|compiled)\b/giu;

const CHANNEL = /\b(conda-forge|Bioconda|bioconda)\b/gu;
const COUNT_WORDS = new Map([
  ["one", 1],
  ["two", 2],
  ["three", 3],
  ["four", 4],
  ["five", 5],
]);
/**
 * Only a channel word may sit between the number and the noun. Allowing general filler read
 * "why two fixtures pin a package of the same name" as a claim that the fixture declares two
 * packages — it counts fixtures, not dependencies.
 */
const DEPENDENCY_COUNT = /\b(One|Two|Three|Four|Five)\b\s+(?:(?:conda-forge|[Bb]ioconda)\s+)?packages?\b/gu;
/**
 * The version must not end on punctuation. A trailing `.` belongs to the sentence, and swallowing
 * it turned `ripser 1.2.1.` into a claim of version `1.2.1.` — a mismatch against a lock that
 * pins exactly what the note says.
 */
const PACKAGE_VERSION = /`?\b([A-Za-z][A-Za-z0-9_.-]{2,})`?\s+v?(\d+\.\d+(?:[\w.]*\w)?)/gu;

/**
 * How far from a platform token to look for the word that says what the claim is about.
 * A sentence routinely carries both kinds — "Verified green on osx-arm64 … with a solved linux-64
 * lock" — so each token binds to its nearest subject rather than the sentence being classified
 * whole.
 */
const SUBJECT_WINDOW = 60;

interface Block {
  /** The paragraph as one line, so a claim wrapped across source lines still reads as a sentence. */
  text: string;
  /** Source line for each character offset in `text`. */
  lineAt: number[];
  /** Physical source lines, for span digests. */
  lines: Map<number, string>;
}

export function extractToolClaims(
  environment: string,
  artifactPath: string,
  noteText: string,
  knownPackages: ReadonlySet<string>,
): ToolClaimScan {
  const claims: ToolClaim[] = [];
  const diagnostics: ExtractionDiagnostic[] = [];
  const ordinals = new Map<string, number>();

  const push = (
    kind: ToolClaimKind,
    asserted: string,
    subject: string | undefined,
    block: Block,
    offset: number,
    length: number,
  ): void => {
    const startLine = block.lineAt[offset] ?? 1;
    const endLine = block.lineAt[Math.min(offset + length - 1, block.lineAt.length - 1)] ?? startLine;
    const sourceText = rangeText(block, startLine, endLine);
    const key = `${kind} ${sourceText} ${asserted}`;
    const ordinal = ordinals.get(key) ?? 0;
    ordinals.set(key, ordinal + 1);
    claims.push({
      id: claimId({ artifactPath, kind, sourceText: `${sourceText} ${asserted}`, ordinal }),
      kind,
      environment,
      asserted,
      ...(subject === undefined ? {} : { subject }),
      span: {
        artifactPath,
        startLine,
        endLine,
        sourceDigest: sourceTextDigest(sourceText),
      },
      context: sentenceAround(block.text, offset),
    });
  };

  for (const block of blocks(noteText)) {
    for (const match of block.text.matchAll(PLATFORM)) {
      const offset = match.index;
      const subject = nearestSubject(block.text, offset, match[0].length);
      if (subject === "build") {
        diagnostics.push(diagnostic(block, offset, artifactPath, "build-subject"));
        continue;
      }
      if (subject === undefined) {
        diagnostics.push(diagnostic(block, offset, artifactPath, "no-subject"));
        continue;
      }
      push("lock-platform", match[0], undefined, block, offset, match[0].length);
    }

    for (const match of block.text.matchAll(DEPENDENCY_COUNT)) {
      const count = COUNT_WORDS.get(match[1].toLowerCase());
      if (count === undefined) continue;
      push("dependency-count", String(count), undefined, block, match.index, match[0].length);
    }

    for (const match of block.text.matchAll(CHANNEL)) {
      const sentence = sentenceAround(block.text, match.index);
      if (!assertsOwnChannel(sentence, match[0])) {
        diagnostics.push(diagnostic(block, match.index, artifactPath, "no-subject"));
        continue;
      }
      push("package-channel", match[0].toLowerCase(), undefined, block, match.index, match[0].length);
    }

    for (const match of block.text.matchAll(PACKAGE_VERSION)) {
      const name = match[1];
      const canonical = name.toLowerCase().replace(/_/gu, "-");
      // The decisive pre-filter. A note is full of numbers that are not package versions —
      // portability grades, article numbers, years, C++ standards, benchmark scores — so a
      // version claim is only promoted when its subject is a package this fixture actually has.
      if (!knownPackages.has(canonical)) {
        if (/^\d+\.\d/u.test(match[2])) {
          diagnostics.push(diagnostic(block, match.index, artifactPath, "unknown-package"));
        }
        continue;
      }
      push("package-version", match[2], canonical, block, match.index, match[0].length);
    }
  }

  return { claims, diagnostics };
}

/**
 * Whether a sentence asserts where *this* fixture's own package comes from.
 *
 * Three shapes defeated the first grammar, and each cost a false accusation:
 *
 * - **Contrast.** "the Bioconda C++ CLI here, the conda-forge Python library there" describes two
 *   fixtures at once, so whichever token the scan reaches first is attributed to the wrong one. A
 *   sentence naming more than one channel is a comparison and asserts nothing on its own.
 * - **Negation.** "it is not a single Bioconda package" is a denial; reading it as a claim inverts
 *   the note's meaning and flags a fixture for saying something true.
 * - **Reference to something else.** "the latter is an unrelated conda-forge project" names a
 *   channel while explicitly disclaiming that it is this fixture's package.
 *
 * What survives is narrow on purpose: a counted package phrase, or an explicit resolve verb.
 * Precision is worth more than recall for a check that gates a build.
 */
function assertsOwnChannel(sentence: string, channel: string): boolean {
  const channels = new Set(
    [...sentence.matchAll(CHANNEL)].map(([token]) => token.toLowerCase()),
  );
  if (channels.size > 1) return false;

  const at = sentence.toLowerCase().indexOf(channel.toLowerCase());
  const before = sentence.slice(0, at < 0 ? sentence.length : at);
  if (/\b(?:not|no|never|isn't|neither|unrelated|different|another)\b/iu.test(before)) return false;

  const counted = new RegExp(
    `\\b(?:One|Two|Three|Four|Five)\\s+(?:${channel}\\s+)?packages?\\b`,
    "iu",
  ).test(sentence);
  const resolves = /\b(?:resolves?|resolving|installs?|pins?|comes? from|taken from)\b/iu.test(sentence);
  return counted || resolves;
}

function diagnostic(
  block: Block,
  offset: number,
  artifactPath: string,
  reason: ExtractionDiagnostic["reason"],
): ExtractionDiagnostic {
  const line = block.lineAt[offset] ?? 1;
  return { artifactPath, line, reason, text: block.lines.get(line) ?? "" };
}

/** Which subject word sits closest to a token — the lock, or a recipe build? */
function nearestSubject(text: string, offset: number, length: number): "lock" | "build" | undefined {
  const left = text.slice(Math.max(0, offset - SUBJECT_WINDOW), offset);
  const right = text.slice(offset + length, offset + length + SUBJECT_WINDOW);
  const distance = (pattern: RegExp): number => {
    let best = Number.POSITIVE_INFINITY;
    for (const match of left.matchAll(pattern)) {
      best = Math.min(best, left.length - (match.index + match[0].length));
    }
    for (const match of right.matchAll(pattern)) best = Math.min(best, match.index);
    return best;
  };
  const lock = distance(LOCK_SUBJECT);
  const build = distance(BUILD_SUBJECT);
  if (lock === Number.POSITIVE_INFINITY && build === Number.POSITIVE_INFINITY) return undefined;
  return lock <= build ? "lock" : "build";
}

function sentenceAround(text: string, offset: number): string {
  const start = Math.max(0, text.lastIndexOf(". ", offset) + 1, text.lastIndexOf("; ", offset) + 1);
  const endMatch = /[.;](?:\s|$)/u.exec(text.slice(offset));
  const end = endMatch ? offset + endMatch.index + 1 : text.length;
  return text.slice(start, end).trim();
}

function rangeText(block: Block, startLine: number, endLine: number): string {
  const parts: string[] = [];
  for (let line = startLine; line <= endLine; line += 1) parts.push(block.lines.get(line) ?? "");
  return parts.join("\n");
}

/**
 * Split a note into paragraphs, keeping a character-to-source-line index.
 *
 * Notes in this corpus are hard-wrapped, so a claim regularly straddles two physical lines. The
 * grammar has to see the joined sentence while the span has to name the real lines, which is why
 * both are carried rather than one being reconstructed from the other.
 */
function blocks(noteText: string): Block[] {
  const withoutFrontmatter = noteText.replace(/^---\n[\s\S]*?\n---\n/u, (matched) =>
    "\n".repeat((matched.match(/\n/gu) ?? []).length),
  );
  const sourceLines = withoutFrontmatter.split("\n");

  const result: Block[] = [];
  let current: Block | undefined;
  let inFence = false;

  sourceLines.forEach((line, index) => {
    const lineNumber = index + 1;
    if (/^\s*```/u.test(line)) {
      inFence = !inFence;
      current = undefined;
      return;
    }
    // A fenced block is an example, not an assertion about this fixture's runtime.
    if (inFence || line.trim() === "" || /^\s*#/u.test(line)) {
      current = undefined;
      return;
    }
    if (current === undefined) {
      current = { text: "", lineAt: [], lines: new Map() };
      result.push(current);
    }
    const separator = current.text === "" ? "" : " ";
    current.text += separator + line;
    for (let index = 0; index < separator.length + line.length; index += 1) {
      current.lineAt.push(lineNumber);
    }
    current.lines.set(lineNumber, line);
  });

  return result;
}
