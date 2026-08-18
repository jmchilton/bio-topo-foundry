import { describe, expect, it } from "vitest";

import {
  adjudicationProblems,
  claimAdjudicationSchema,
  artifactSpanSchema,
  sourceTextDigest,
} from "../src/lib/audit/base/claims";
import {
  buildToolAlignmentRun,
  toolAlignmentRunSchema,
} from "../src/lib/audit/tool-alignment/audit";
import { evaluateClaim } from "../src/lib/audit/tool-alignment/evaluate";
import {
  extractManifestClaims,
  extractToolClaims,
} from "../src/lib/audit/tool-alignment/extract";
import { renderToolAlignmentMarkdown } from "../src/lib/audit/tool-alignment/report";
import type { PixiEvidence } from "../src/lib/audit/tool-alignment/pixi";
import {
  RUN_JSON_PATH,
  RUN_MARKDOWN_PATH,
  replayToolAlignmentAudit,
} from "../src/lib/tool-alignment-audit";

const replay = await replayToolAlignmentAudit();
const { run } = replay;

const claimById = new Map(run.claims.map((claim) => [claim.id, claim]));
const findingsWhere = (predicate: (verdict: string) => boolean) =>
  run.findings.filter(({ effectiveVerdict }) => predicate(effectiveVerdict)).map((finding) => {
    const claim = claimById.get(finding.claimId);
    const at = claim ? `${claim.span.artifactPath}:${claim.span.startLine}` : finding.claimId;
    return `${at} [${finding.effectiveVerdict}] ${finding.detail ?? ""}`;
  });

describe("runtime claims in the committed corpus", () => {
  it("audits a corpus that is not empty", () => {
    expect(run.claims.length).toBeGreaterThan(0);
    expect(run.summary.extracted).toBe(run.claims.length);
    expect(run.summary.assessed + run.summary.withdrawn).toBe(run.summary.extracted);
  });

  it("states nothing the committed runtime contradicts", () => {
    expect(
      findingsWhere((verdict) => verdict === "wrong-value" || verdict === "absent"),
      "repair the note, repin the manifest, or record a reviewed decision in audit/tool-alignment-adjudications.json",
    ).toEqual([]);
  });

  it("leaves no flagged finding unreviewed", () => {
    expect(run.summary.review.completed).toBe(run.summary.review.required);
  });

  it("keeps the committed report replayable from the committed corpus", () => {
    expect(replay.markdown, `${RUN_MARKDOWN_PATH} is stale; run pnpm audit:tools`).toBe(
      replay.committedMarkdown,
    );
    expect(replay.run, `${RUN_JSON_PATH} is stale; run pnpm audit:tools`).toEqual(
      replay.committedRun,
    );
  });
});

/**
 * The checker's own precision, measured against planted cases rather than asserted.
 *
 * Every one of these except the last is a defect the first draft of the grammar actually shipped;
 * they are here because an audit whose false-positive rate exceeds its finding rate is worse than
 * no audit, and the only way that stays true is if the cases that produced it stay checked.
 */
describe("claim extraction", () => {
  const evidence: PixiEvidence = {
    environment: "example",
    declaredChannels: ["conda-forge", "bioconda"],
    declaredPlatforms: ["linux-64"],
    declaredDependencies: ["ripser"],
    pathDependencies: [],
    lockedPlatforms: ["linux-64"],
    lockedPackages: new Map([
      ["ripser", { name: "ripser", version: "1.2.1", build: "h0", channel: "bioconda", subdir: "linux-64" }],
    ]),
  };

  const extract = (text: string) =>
    extractToolClaims("example", "content/environments/example/index.md", text, new Set(["ripser"]));

  it("does not read 'unblocks' as a claim about a lockfile", () => {
    const { claims } = extract("This unblocks the linux-64 story for everyone.");
    expect(claims.filter(({ kind }) => kind === "lock-platform")).toEqual([]);
  });

  it("binds each platform to its own subject within one sentence", () => {
    const { claims } = extract(
      "Verified green on osx-arm64 — build and asserts — with a solved linux-64 lock.",
    );
    expect(claims.filter(({ kind }) => kind === "lock-platform").map(({ asserted }) => asserted)).toEqual([
      "linux-64",
    ]);
  });

  it("counts dependencies, not fixtures", () => {
    const { claims } = extract("See the sibling for why two fixtures pin a package of the same name.");
    expect(claims.filter(({ kind }) => kind === "dependency-count")).toEqual([]);
  });

  it("refuses a channel claim that contrasts two fixtures", () => {
    const { claims } = extract(
      "Both pin a package called `ripser`, but from different channels — the Bioconda CLI here, the conda-forge library there.",
    );
    expect(claims.filter(({ kind }) => kind === "package-channel")).toEqual([]);
  });

  it("refuses a negated channel claim", () => {
    const { claims } = extract("It resolves from conda-forge, but it is not a single Bioconda package.");
    expect(claims.filter(({ kind }) => kind === "package-channel")).toEqual([]);
  });

  /**
   * The first defect found in prose this session did not write, and the reason it matters: a note
   * that names its own repair is a note the audit is working on, so this shape appears exactly
   * where findings are being fixed.
   */
  it("refuses a claim about a runtime the fixture does not have", () => {
    const { claims } = extract(
      "Bioconda's build of the same version does have one, so a channel pin and a re-lock would move this fixture to L4.",
    );
    expect(claims.filter(({ kind }) => kind === "package-channel")).toEqual([]);
  });

  it("declines a hypothetical for every claim kind, not only channels", () => {
    const { claims } = extract(
      "If it pinned ripser 1.2.1 from Bioconda instead, one package would solve on linux-64.",
    );
    expect(claims).toEqual([]);
  });

  it("refuses a version claim whose subject is not a package this fixture has", () => {
    const { claims } = extract("The fixture needs `cmake <4` because the submodule predates 3.5.");
    expect(claims.filter(({ kind }) => kind === "package-version")).toEqual([]);
  });

  it("still reads the claim shapes it is for", () => {
    const { claims } = extract("One Bioconda package, locked green on linux-64. It pins ripser 1.2.1.");
    expect(claims.map(({ kind, asserted }) => `${kind}=${asserted}`).sort()).toEqual([
      "dependency-count=1",
      "lock-platform=linux-64",
      "package-channel=bioconda",
      "package-version=1.2.1",
    ]);
    for (const claim of claims) {
      expect(evaluateClaim(claim, evidence).verdict, `${claim.kind} ${claim.asserted}`).toBe("exists");
    }
  });
});

/**
 * What a reviewed decision may and may not do to a number.
 *
 * The failure these guard against is a checker that can be talked out of its own findings: if any
 * adjudication could turn a contradiction into a claim that holds, the pass rate would measure how
 * much review had happened rather than how correct the corpus was.
 */
describe("adjudication", () => {
  const evidence: PixiEvidence = {
    environment: "example",
    declaredChannels: ["conda-forge"],
    declaredPlatforms: ["linux-64"],
    declaredDependencies: ["ripser"],
    pathDependencies: [],
    lockedPlatforms: ["linux-64"],
    lockedPackages: new Map([
      ["ripser", { name: "ripser", version: "2.0.0", build: "h0", channel: "conda-forge", subdir: "linux-64" }],
    ]),
  };

  // A version the lock contradicts, so every case below starts from a real `wrong-value`.
  const { claims } = extractToolClaims(
    "example",
    "content/environments/example/index.md",
    "It pins ripser 1.2.1.",
    new Set(["ripser"]),
  );
  const claim = claims.find(({ kind }) => kind === "package-version");
  const build = (adjudications: Parameters<typeof buildToolAlignmentRun>[3]["adjudications"]) =>
    buildToolAlignmentRun(claims, new Map([["example", evidence]]), [], {
      adjudications,
      generatedAt: "2026-01-01T00:00:00.000Z",
    });

  it("starts from a genuine contradiction", () => {
    expect(claim).toBeDefined();
    expect(build([]).summary.byVerdict["wrong-value"]).toBe(1);
  });

  it("withdraws an extractor false positive instead of scoring it as a claim that holds", () => {
    const run = build([
      {
        claimId: claim!.id,
        sourceDigest: claim!.span.sourceDigest,
        classification: "extractor-false-positive",
        note: "the sentence is prose about a different package",
      },
    ]);
    expect(run.summary.withdrawn).toBe(1);
    expect(run.summary.assessed).toBe(run.summary.extracted - 1);
    // The decisive assertion: withdrawal must not manufacture a pass.
    expect(run.summary.byVerdict.exists).toBe(0);
    expect(run.summary.byVerdict["wrong-value"]).toBe(0);
  });

  it("keeps the machine verdict beside the reviewed one", () => {
    const run = build([
      {
        claimId: claim!.id,
        sourceDigest: claim!.span.sourceDigest,
        classification: "checker-false-positive",
        assertedVerdict: "exists",
        note: "the lock records a repackaged build of the same release",
      },
    ]);
    const [finding] = run.findings;
    expect(finding.verdict).toBe("wrong-value");
    expect(finding.effectiveVerdict).toBe("exists");
    expect(finding.withdrawn).toBe(false);
  });

  it("never lets a reviewed finding contradict the table it is rendered in", () => {
    const run = build([
      {
        claimId: claim!.id,
        sourceDigest: claim!.span.sourceDigest,
        classification: "checker-false-positive",
        assertedVerdict: "exists",
        note: "the lock records a repackaged build of the same release",
      },
    ]);
    const markdown = renderToolAlignmentMarkdown(run);
    expect(markdown).toContain("No claim was contradicted by the runtime it names.");
    expect(markdown).toContain("| `wrong-value` | checker-false-positive | `exists` |");
  });

  it("refuses a checker-false-positive that names no replacement verdict", () => {
    expect(
      claimAdjudicationSchema.safeParse({
        claimId: "abc",
        sourceDigest: "0".repeat(64),
        classification: "checker-false-positive",
        note: "wrong",
      }).success,
    ).toBe(false);
  });

  it("ignores a decision whose reviewed text has changed", () => {
    const run = build([
      {
        claimId: claim!.id,
        sourceDigest: "f".repeat(64),
        classification: "extractor-false-positive",
        note: "recorded against text that has since been rewritten",
      },
    ]);
    expect(run.summary.withdrawn).toBe(0);
    expect(run.summary.byVerdict["wrong-value"]).toBe(1);
  });

  it("reports a decision that names no live claim, and stays quiet about a retired one", () => {
    const live = { id: "a", span: { sourceDigest: "1".repeat(64) } };
    expect(
      adjudicationProblems(
        [live],
        [
          { claimId: "a", sourceDigest: "1".repeat(64) },
          { claimId: "a", sourceDigest: "1".repeat(64) },
          { claimId: "ghost", sourceDigest: "1".repeat(64) },
          { claimId: "a", sourceDigest: "2".repeat(64) },
        ],
      ).map(({ kind }) => kind),
    ).toEqual(["duplicate-claim", "unknown-claim", "duplicate-claim"]);

    expect(
      adjudicationProblems([live], [{ claimId: "a", sourceDigest: "2".repeat(64) }]).map(
        ({ kind }) => kind,
      ),
    ).toEqual(["retired"]);
  });
});

describe("the persisted run is validated, not asserted", () => {
  it("verifies a span digest against the text it covers", () => {
    const span = {
      artifactKind: "environment-note",
      artifactPath: "content/environments/example/index.md",
      startLine: 3,
      endLine: 3,
      sourceText: "One conda-forge package.",
      sourceDigest: sourceTextDigest("One conda-forge package."),
    };
    expect(artifactSpanSchema.safeParse(span).success).toBe(true);
    expect(
      artifactSpanSchema.safeParse({ ...span, sourceText: "Something else entirely." }).success,
    ).toBe(false);
    expect(artifactSpanSchema.safeParse({ ...span, endLine: 1 }).success).toBe(false);
  });

  it("rejects a run whose summary disagrees with its own claims", () => {
    const run = buildToolAlignmentRun([], new Map(), [], {
      adjudications: [],
      generatedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(toolAlignmentRunSchema.safeParse(run).success).toBe(true);
    expect(
      toolAlignmentRunSchema.safeParse({
        ...run,
        summary: { ...run.summary, assessed: run.summary.assessed + 1 },
      }).success,
    ).toBe(false);
  });
});

describe("evidence the reader could not decode is never a finding", () => {
  /**
   * The failure this replaced: a lock entry the reader skipped removed its package from the
   * evidence, and a claim about a package the evidence lacks reads as a contradiction. A parser gap
   * therefore did not weaken the audit, it made it accuse a correct note.
   */
  it("declines a channel claim when the lock does not account for a declared dependency", () => {
    const { claims } = extractToolClaims(
      "example",
      "content/environments/example/index.md",
      "One conda-forge package, locked green.",
      new Set(["mystery"]),
    );
    const channel = claims.find(({ kind }) => kind === "package-channel");
    expect(channel).toBeDefined();

    const finding = evaluateClaim(channel!, {
      environment: "example",
      declaredChannels: ["conda-forge"],
      declaredPlatforms: ["linux-64"],
      declaredDependencies: ["mystery"],
      pathDependencies: [],
      lockedPlatforms: ["linux-64"],
      lockedPackages: new Map(),
    });
    expect(finding.verdict).toBe("unavailable");
    expect(finding.severity).toBeUndefined();
  });

  it("reads both wheel and sdist PyPI entries", async () => {
    const { readPixiEvidence } = await import("../src/lib/audit/tool-alignment/pixi");
    // hiponet locks a PyPI closure, including one sdist. Before the reader knew either shape, all
    // of it silently vanished from the evidence.
    const evidence = await readPixiEvidence("../content/environments/hiponet", "hiponet");
    expect(evidence.lockedPackages?.get("torch")?.channel).toBe("pypi");
    expect(evidence.lockedPackages?.get("antlr4-python3-runtime")?.version).toBe("4.9.3");
  });
});

describe("the manifest header is prose too", () => {
  const header = [
    "# Dionysus 2 — persistent (co)homology, vineyards, zigzag persistence.",
    "# conda-forge, community-maintained → L3. (conda-forge dionysus=2.2.3, 2026-07-29)",
    "[workspace]",
    'channels = ["conda-forge", "bioconda"]',
    "",
    "[dependencies]",
    "dionysus = 3.0.0",
    "",
  ].join("\n");

  const scan = extractManifestClaims(
    "dionysus",
    "content/environments/dionysus/pixi.toml",
    header,
    new Set(["dionysus"]),
  );

  it("reads a pin spec as a claim that names its own package", () => {
    const channel = scan.claims.find(({ kind }) => kind === "package-channel");
    const version = scan.claims.find(({ kind }) => kind === "package-version");
    expect(channel).toMatchObject({ asserted: "conda-forge", subject: "dionysus" });
    expect(version).toMatchObject({ asserted: "2.2.3", subject: "dionysus" });
    expect(channel?.span.artifactKind).toBe("environment-manifest");
  });

  /**
   * The tables are what the claims are checked against. Reading them as prose would compare the
   * file to itself and pass whatever it said — `dionysus = 3.0.0` above is a table entry, not an
   * assertion, and must never become a claim of version 3.0.0.
   */
  it("reads only whole-line comments, never the tables they describe", () => {
    expect(scan.claims.some(({ asserted }) => asserted === "3.0.0")).toBe(false);
    for (const claim of scan.claims) expect(claim.span.sourceText.trimStart()).toMatch(/^#/u);
  });
});

describe("a sentence about someone else's runtime is not a claim about this one", () => {
  const declined = (environment: string, text: string) =>
    extractManifestClaims(
      environment,
      `content/environments/${environment}/pixi.toml`,
      `# ${text}\n`,
      new Set(["torch", "topometry"]),
    );

  /** `hiponet`'s header records what upstream's own resolver pins, which is true of upstream. */
  it("declines a version another resolver pins", () => {
    const scan = declined("hiponet", "It is uv-managed (uv.lock pins torch 2.8).");
    expect(scan.claims).toHaveLength(0);
    expect(scan.diagnostics.map(({ reason }) => reason)).toContain("other-runtime");
  });

  /** A header explains itself by contrast with the sibling fixture it is not. */
  it("declines a pin belonging to a different fixture", () => {
    const scan = declined(
      "topometry-1.1",
      "WHY NOT `content/environments/topometry/`: that env pins conda-forge topometry 0.2.1.1 today.",
    );
    expect(scan.claims).toHaveLength(0);
    expect(scan.diagnostics.map(({ reason }) => reason)).toContain("other-runtime");
  });

  it("still reads a sentence naming its own environment", () => {
    const scan = declined(
      "topometry",
      "`content/environments/topometry/` installs conda-forge topometry=0.2.1.1 today.",
    );
    expect(scan.claims.map(({ kind }) => kind)).toContain("package-channel");
  });
});

/**
 * The sentence that produced both of these, as it stood in `open-topoqa-featurizer/pixi.toml`.
 *
 * Two pre-filters declined it independently, and between them they hid the only claim in this
 * corpus the lock actually contradicted: it said `dssp` came from Bioconda while the lock beside
 * it resolved `dssp` from conda-forge, and the fixture next door says outright that Bioconda has
 * no `dssp` at all. A checker tuned for precision earns that tuning by being wrong in the
 * declining direction only where declining is right.
 */
describe("a sentence that binds a channel to each of two packages is two claims, not a comparison", () => {
  const scan = extractManifestClaims(
    "example",
    "content/environments/example/pixi.toml",
    [
      "# every run dep is on a public channel — numpy/gudhi/biopython from conda-forge and `dssp`",
      "# (mkdssp binary, for 8-state SS + relative SASA) from bioconda — so they resolve from",
      "# channels rather than sibling path recipes.",
      "",
    ].join("\n"),
    new Set(["numpy", "gudhi", "biopython", "dssp"]),
  );

  /** `rather than` is contrast, not condition. Only a modal or a conditional makes a sentence one. */
  it("does not read a contrast word as a counterfactual", () => {
    expect(scan.diagnostics.map(({ reason }) => reason)).not.toContain("hypothetical");
  });

  /**
   * Two channels in one sentence is the comparison shape `assertsOwnChannel` exists to refuse — but
   * a comparison names two channels for one package, and this names one channel for each of two.
   */
  it("binds each channel to the packages named before it", () => {
    expect(
      scan.claims
        .filter(({ kind }) => kind === "package-channel")
        .map(({ subject, asserted }) => `${subject}=${asserted}`),
    ).toEqual(["biopython=conda-forge", "dssp=bioconda"]);
  });

  /**
   * The binding is what supplies the subject, so prose that binds nothing this fixture has must
   * still fall through to the weaker fixture-wide question rather than inventing one.
   */
  it("leaves a binding that names no package of this fixture's to the prose grammar", () => {
    const { claims } = extractManifestClaims(
      "example",
      "content/environments/example/pixi.toml",
      "# It resolves from conda-forge.\n",
      new Set(["numpy"]),
    );
    expect(claims.map(({ kind, asserted, subject }) => `${kind}=${asserted}:${String(subject)}`)).toEqual([
      "package-channel=conda-forge:undefined",
    ]);
  });
});

describe("a package the lock cannot contain is not a package the lock contradicts", () => {
  const pathFixture: PixiEvidence = {
    environment: "kmapper",
    declaredChannels: ["conda-forge"],
    declaredPlatforms: ["linux-64"],
    declaredDependencies: ["kmapper"],
    pathDependencies: ["kmapper"],
    lockedPlatforms: ["linux-64"],
    lockedPackages: new Map(),
  };

  /**
   * An in-repo recipe is deliberately on no channel, so its absence from the lock is the expected
   * shape. Reporting it as `absent` accused three correct headers of naming a package that does
   * not exist.
   */
  it("reports a path recipe's version as unpinned rather than absent", () => {
    const { claims } = extractManifestClaims(
      "kmapper",
      "content/environments/kmapper/pixi.toml",
      "# KeplerMapper — (PyPI kmapper==2.1.0, 2026-07-29)\n",
      new Set(["kmapper"]),
    );
    const version = claims.find(({ kind }) => kind === "package-version");
    expect(version).toBeDefined();
    const finding = evaluateClaim(version!, pathFixture);
    expect(finding.verdict).toBe("unpinned");
    expect(finding.severity).toBeUndefined();
  });
});

describe("a channel claim that names its package is answered by that package", () => {
  /**
   * The fixture-wide question — does *any* dependency resolve from this channel — gives the right
   * answer only while a fixture resolves from one. This evidence is mixed, so the two questions
   * disagree, and the fixture-wide one would report a false claim as holding.
   */
  const mixed: PixiEvidence = {
    environment: "example",
    declaredChannels: ["conda-forge", "bioconda"],
    declaredPlatforms: ["linux-64"],
    declaredDependencies: ["dockq", "mmseqs2"],
    pathDependencies: [],
    lockedPlatforms: ["linux-64"],
    lockedPackages: new Map([
      ["dockq", { name: "dockq", version: "2.1.3", build: "0", channel: "conda-forge", subdir: "linux-64" }],
      ["mmseqs2", { name: "mmseqs2", version: "18.8cc5c", build: "0", channel: "bioconda", subdir: "linux-64" }],
    ]),
  };

  it("contradicts a named package the lock resolves elsewhere", () => {
    const { claims } = extractManifestClaims(
      "example",
      "content/environments/example/pixi.toml",
      "# DockQ — (bioconda dockq=2.1.3, 2026-07-30)\n",
      new Set(["dockq", "mmseqs2"]),
    );
    const channel = claims.find(({ kind }) => kind === "package-channel");
    expect(channel).toMatchObject({ asserted: "bioconda", subject: "dockq" });

    const finding = evaluateClaim(channel!, mixed);
    expect(finding.verdict).toBe("wrong-value");
    expect(finding.observed).toBe("conda-forge");
  });
});

describe("evidence the reader would flatten stops the audit", () => {
  /**
   * One name resolving to two artifacts is not a repetition. Answering a claim about one platform
   * with the other platform's pin would report a correct note as wrong-value, so the reader refuses
   * rather than picking whichever the lock happened to list first.
   */
  const twoPlatforms = [
    "version: 7",
    "platforms:",
    "- name: linux-64",
    "  virtual-packages:",
    "  - __unix=0=0",
    "- name: osx-arm64",
    "  virtual-packages:",
    "  - __unix=0=0",
    "environments:",
    "  default:",
    "    packages:",
    "      linux-64:",
    "      - conda: https://conda.anaconda.org/conda-forge/linux-64/gudhi-3.13.0-py313hf0a2c11_0.conda",
    "      osx-arm64:",
    "      - conda: https://conda.anaconda.org/conda-forge/osx-arm64/gudhi-3.12.0-py313h8a5c2de_0.conda",
    "",
  ].join("\n");

  it("refuses a lock that solved more than one platform", async () => {
    const { readLock, MultiPlatformLock } = await import("../src/lib/audit/tool-alignment/pixi");
    expect(() => readLock(twoPlatforms, "example")).toThrow(MultiPlatformLock);
    // The message has to name both, or the reader reports a problem nobody can locate.
    expect(() => readLock(twoPlatforms, "example")).toThrow(/linux-64, osx-arm64/u);
  });

  it("still reads a lock that solved one", async () => {
    const { readLock } = await import("../src/lib/audit/tool-alignment/pixi");
    const single = twoPlatforms
      .split("\n")
      .filter((line) => !line.includes("osx-arm64"))
      .join("\n");
    const evidence = readLock(single, "example");
    expect(evidence.lockedPlatforms).toEqual(["linux-64"]);
    expect(evidence.lockedPackages?.get("gudhi")?.version).toBe("3.13.0");
  });
});

describe("verdicts keep unfalsifiable claims out of the failure partitions", () => {
  const lockless: PixiEvidence = {
    environment: "example",
    declaredChannels: ["conda-forge"],
    declaredPlatforms: ["linux-64"],
    declaredDependencies: ["thing"],
    pathDependencies: ["thing"],
  };

  it("reports a missing lock as unavailable rather than absent", () => {
    const { claims } = extractToolClaims(
      "example",
      "content/environments/example/index.md",
      "Locked green on linux-64.",
      new Set(),
    );
    expect(claims).toHaveLength(1);
    const finding = evaluateClaim(claims[0], lockless);
    expect(finding.verdict).toBe("unavailable");
    expect(finding.severity).toBeUndefined();
  });
});
