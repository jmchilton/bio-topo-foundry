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

/**
 * The artifacts this checker reads prose out of.
 *
 * A note is the document a reader is pointed at; a manifest header is the comment the person
 * editing the manifest sees. They assert the same four things about the same runtime, and being
 * two files is the whole reason the second one drifts.
 */
export const artifactKinds = ["environment-note", "environment-manifest"] as const;
export type ArtifactKind = (typeof artifactKinds)[number];

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
  reason: "build-subject" | "no-subject" | "unknown-package" | "hypothetical" | "other-runtime";
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
 *
 * The separator admits `=` and `==` as well as a space, because a manifest header writes its
 * versions as pin specs — `dionysus=2.2.3` — rather than as prose.
 */
const PACKAGE_VERSION =
  /`?\b([A-Za-z][A-Za-z0-9_.-]{2,})`?(?:\s+|\s*={1,2}\s*)v?(\d+\.\d+(?:[\w.]*\w)?)/gu;

/**
 * The pin triple: `<channel> <name>=<version>`.
 *
 * Manifest headers close on this shape — `(conda-forge dionysus=2.2.3, 2026-07-29)` — and it is the
 * first channel claim in this corpus that names the package it is about. Prose has to be argued
 * with, which is what `assertsOwnChannel` does and why it declines so much; a pin spec states its
 * subject, so it is matched as its own shape instead.
 */
const CHANNEL_PIN =
  /\b(conda-forge|[Bb]ioconda)\s+([A-Za-z][A-Za-z0-9_.-]{2,})\s*={1,2}\s*\d/gu;

/**
 * A channel a preposition binds to the packages named before it: `numpy/gudhi/biopython from
 * conda-forge`.
 *
 * The pin spec states its subject as a triple; prose states it by binding, and the two deserve the
 * same answer. Without this the contrastive pre-filter refuses the whole sentence — it names two
 * channels, so it looks like the comparison shape `assertsOwnChannel` exists to decline — and that
 * refusal is what let `open-topoqa-featurizer` assert `dssp` came from Bioconda while its own lock
 * resolved it from conda-forge. A comparison names two channels for one package; this names one
 * channel for each of two, which is two claims rather than none.
 *
 * The preposition is required. A channel token can appear in a sentence about anything —
 * "conda-forge also ships a `ripser`" is a warning about a name collision — and only a binding word
 * says the packages beside it are where this claim's subject comes from.
 */
const BOUND_CHANNEL = /\b(?:from|on|via)\s+(conda-forge|[Bb]ioconda)\b/gu;

/** A word that could be a package name, for the scan that decides which one a channel binds. */
const NAME_TOKEN = /[A-Za-z][A-Za-z0-9_.-]{2,}/gu;

/**
 * How far from a platform token to look for the word that says what the claim is about.
 * A sentence routinely carries both kinds — "Verified green on osx-arm64 … with a solved linux-64
 * lock" — so each token binds to its nearest subject rather than the sentence being classified
 * whole.
 */
const SUBJECT_WINDOW = 60;

/**
 * A sentence describing a runtime other than the committed one.
 *
 * The whole checker rests on comparing what a note says against what the lock did, so a sentence
 * about what a *different* lock would do is outside its subject entirely. This is the fifth
 * extractor defect the corpus produced, and the first found in prose written by someone else:
 * "a channel pin and a re-lock would move this fixture to L4" reads `pin` as an assertion that the
 * fixture pins that channel, when the sentence exists to say it does not. Repair advice is the
 * natural thing to write beside a finding, which makes this shape common exactly where the audit
 * is working.
 *
 * `rather than` and `instead of` were on this list and do not belong on it. They are contrast, not
 * condition, and English uses them to say what a thing *is* at least as often as what it would
 * otherwise be: "every run dep … resolves from channels rather than sibling path recipes" asserts
 * something about this fixture and its lock can answer it. Declining it cost the audit the only
 * wrong channel claim the corpus actually carried, on the first run that could have caught it. A
 * counterfactual needs a modal or a conditional; a contrast word on its own is not one.
 */
const HYPOTHETICAL = /\b(?:would|could|should|might|if|unless)\b/iu;

/**
 * A sentence about a runtime that exists but is not this one.
 *
 * Both shapes arrived with the manifest headers, and both are the same error as the hypothetical:
 * the sentence has a subject, and it is not the lock committed beside this file.
 *
 * - **Another resolver.** `hiponet`'s header records what upstream pins — "uv.lock pins torch 2.8 /
 *   numpy 2.3.2 / scanpy 1.11.4" — which is true of upstream's lock and says nothing about this
 *   fixture's.
 * - **Another fixture.** A header explains itself by contrast with the neighbour it is not: "WHY
 *   NOT `content/environments/topometry/`: that env pins conda-forge topometry 0.2.1.1". Reading
 *   that as this fixture's pin accuses a file for describing its sibling accurately.
 */
const FOREIGN_RUNTIME =
  /\b(?:uv\.lock|poetry\.lock|Cargo\.lock|package-lock\.json|conda-lock|requirements(?:\.txt)?|environment\.yml|\.python-version)\b/iu;
const ENVIRONMENT_PATH = /content\/environments\/([a-z0-9._-]+)/giu;

interface Block {
  /** The paragraph as one line, so a claim wrapped across source lines still reads as a sentence. */
  text: string;
  /** Source line for each character offset in `text`. */
  lineAt: number[];
  /** Physical source lines, for span digests. */
  lines: Map<number, string>;
}

/** Claims in the body of an Environment note. */
export function extractToolClaims(
  environment: string,
  artifactPath: string,
  noteText: string,
  knownPackages: ReadonlySet<string>,
): ToolClaimScan {
  return scan(environment, "environment-note", artifactPath, noteBlocks(noteText), knownPackages);
}

/**
 * Claims in a `pixi.toml` header comment.
 *
 * The same grammar reads both, which is the point: a header asserting a channel is asserting the
 * thing a note asserts, and two grammars would drift apart exactly as the two files do. Only the
 * step that turns a file into prose differs.
 */
export function extractManifestClaims(
  environment: string,
  artifactPath: string,
  manifestText: string,
  knownPackages: ReadonlySet<string>,
): ToolClaimScan {
  return scan(
    environment,
    "environment-manifest",
    artifactPath,
    commentBlocks(manifestText),
    knownPackages,
  );
}

function scan(
  environment: string,
  artifactKind: ArtifactKind,
  artifactPath: string,
  prose: readonly Block[],
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
        artifactKind,
        artifactPath,
        startLine,
        endLine,
        sourceText,
        sourceDigest: sourceTextDigest(sourceText),
      },
      context: sentenceAround(block.text, offset),
    });
  };

  /**
   * Applied ahead of every extractor rather than only the one it bit. The defect is not about
   * channels: any token in a sentence whose subject is some other runtime — one that does not
   * exist, one another resolver owns, or one belonging to a different fixture — describes that
   * runtime and not this one.
   */
  const notThisRuntime = (offset: number, block: Block): boolean => {
    const sentence = sentenceAround(block.text, offset);
    if (HYPOTHETICAL.test(sentence)) {
      diagnostics.push(diagnostic(block, offset, artifactPath, "hypothetical"));
      return true;
    }
    const elsewhere =
      FOREIGN_RUNTIME.test(sentence) ||
      [...sentence.matchAll(ENVIRONMENT_PATH)].some(([, slug]) => slug !== environment);
    if (!elsewhere) return false;
    diagnostics.push(diagnostic(block, offset, artifactPath, "other-runtime"));
    return true;
  };

  for (const block of prose) {
    for (const match of block.text.matchAll(PLATFORM)) {
      const offset = match.index;
      if (notThisRuntime(offset, block)) continue;
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
      if (notThisRuntime(match.index, block)) continue;
      push("dependency-count", String(count), undefined, block, match.index, match[0].length);
    }

    // A pin spec states which package it is about, so it is read first and its channel token is
    // not offered to the prose grammar afterwards.
    const pinned = new Set<number>();
    for (const match of block.text.matchAll(CHANNEL_PIN)) {
      // Claimed either way: whatever this extractor decided about the token is the decision, and
      // letting the prose grammar see it again would count one refusal twice.
      pinned.add(match.index);
      const canonical = match[2].toLowerCase().replace(/_/gu, "-");
      if (!knownPackages.has(canonical)) {
        diagnostics.push(diagnostic(block, match.index, artifactPath, "unknown-package"));
        continue;
      }
      if (notThisRuntime(match.index, block)) continue;
      push("package-channel", match[1].toLowerCase(), canonical, block, match.index, match[1].length);
    }

    // The same rule one step weaker: prose that binds a channel to a package it names. A binding
    // that finds no package of this fixture's is left to the prose grammar below, which asks the
    // fixture-wide question instead — "it resolves from conda-forge" names nothing and always did.
    for (const match of block.text.matchAll(BOUND_CHANNEL)) {
      const at = match.index + match[0].length - match[1].length;
      if (pinned.has(at)) continue;
      const subject = boundPackage(block.text, at, knownPackages);
      if (subject === undefined) continue;
      pinned.add(at);
      if (notThisRuntime(at, block)) continue;
      push("package-channel", match[1].toLowerCase(), subject, block, at, match[1].length);
    }

    for (const match of block.text.matchAll(CHANNEL)) {
      if (pinned.has(match.index)) continue;
      if (notThisRuntime(match.index, block)) continue;
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
      if (notThisRuntime(match.index, block)) continue;
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

/**
 * Which of this fixture's packages a bound channel token is about.
 *
 * Scoped to the sentence, then to the run of text since the previous channel token: each channel
 * owns the packages named between it and the one before it. That is what makes a two-channel
 * sentence two claims instead of a comparison — "numpy/gudhi/biopython from conda-forge and `dssp`
 * (…) from bioconda" binds `biopython` to the first and `dssp` to the second, with no window to
 * tune and nothing crossing the boundary between them.
 *
 * The nearest name wins, not every name, so a list is read as a claim about its last member.
 * A quantifier would be needed to say more — "all of them" and "one of them" are different claims
 * — and no sentence here supplies one, so the rest of a list stays unread rather than assumed.
 */
function boundPackage(
  text: string,
  offset: number,
  knownPackages: ReadonlySet<string>,
): string | undefined {
  const left = text.slice(sentenceStart(text, offset), offset);
  const previousChannel = [...left.matchAll(CHANNEL)].at(-1);
  const segment =
    previousChannel === undefined
      ? left
      : left.slice(previousChannel.index + previousChannel[0].length);

  let nearest: string | undefined;
  for (const token of segment.matchAll(NAME_TOKEN)) {
    const canonical = token[0].toLowerCase().replace(/_/gu, "-");
    if (knownPackages.has(canonical)) nearest = canonical;
  }
  return nearest;
}

function sentenceStart(text: string, offset: number): number {
  return Math.max(0, text.lastIndexOf(". ", offset) + 1, text.lastIndexOf("; ", offset) + 1);
}

function sentenceAround(text: string, offset: number): string {
  const endMatch = /[.;](?:\s|$)/u.exec(text.slice(offset));
  const end = endMatch ? offset + endMatch.index + 1 : text.length;
  return text.slice(sentenceStart(text, offset), end).trim();
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
function noteBlocks(noteText: string): Block[] {
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

/**
 * Split a manifest's whole-line comments into paragraphs.
 *
 * A comment is the only thing in a `pixi.toml` that can be wrong on its own. The tables below it
 * are the authority the audit checks against, so reading them as prose would compare the file to
 * itself; a header line describing them is an assertion like any other, and until now nothing read
 * it. A bare `#` separates paragraphs the way a blank line does in a note.
 *
 * The block carries the stripped comment text so the grammar reads a sentence, and the physical
 * lines unchanged so a span quotes the file as it is written.
 */
function commentBlocks(manifestText: string): Block[] {
  const result: Block[] = [];
  let current: Block | undefined;

  manifestText.split("\n").forEach((line, index) => {
    const comment = /^\s*#[ \t]?(.*)$/u.exec(line);
    if (comment === null || comment[1].trim() === "") {
      current = undefined;
      return;
    }
    if (current === undefined) {
      current = { text: "", lineAt: [], lines: new Map() };
      result.push(current);
    }
    const separator = current.text === "" ? "" : " ";
    current.text += separator + comment[1];
    for (let offset = 0; offset < separator.length + comment[1].length; offset += 1) {
      current.lineAt.push(index + 1);
    }
    current.lines.set(index + 1, line);
  });

  return result;
}
