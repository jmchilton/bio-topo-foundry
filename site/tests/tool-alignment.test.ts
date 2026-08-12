import { describe, expect, it } from "vitest";

import { evaluateClaim } from "../src/lib/audit/tool-alignment/evaluate";
import { extractToolClaims } from "../src/lib/audit/tool-alignment/extract";
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
    expect(run.summary.total).toBe(run.claims.length);
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
