import type { ClaimSeverity, EvidenceState } from "../base/claims";
import type { ToolClaim } from "./extract";
import { canonicalPackageName, type PixiEvidence } from "./pixi";

/**
 * Compare each claim against the runtime the fixture actually pins.
 *
 * The verdict vocabulary is the spec's: a claim either holds, names something the runtime does not
 * have, states a value the runtime contradicts, or cannot be falsified at all. The last two cases
 * are kept apart from the first two on purpose — `unpinned` and `unavailable` are never failures,
 * because a fixture that declares less is not a fixture caught lying, and scoring it as one would
 * punish the honest direction.
 */
export const toolVerdicts = ["exists", "absent", "wrong-value", "unpinned", "unavailable"] as const;
export type ToolVerdict = (typeof toolVerdicts)[number];

export interface ToolFinding {
  claimId: string;
  verdict: ToolVerdict;
  evidenceState: EvidenceState;
  severity?: ClaimSeverity;
  /** What the runtime says, where it says anything. */
  observed?: string;
  /** Present whenever the verdict needs explaining; a claim that simply holds does not. */
  detail?: string;
}

export function evaluateClaim(claim: ToolClaim, evidence: PixiEvidence): ToolFinding {
  switch (claim.kind) {
    case "lock-platform":
      return evaluateLockPlatform(claim, evidence);
    case "dependency-count":
      return evaluateDependencyCount(claim, evidence);
    case "package-channel":
      return evaluatePackageChannel(claim, evidence);
    case "package-version":
      return evaluatePackageVersion(claim, evidence);
  }
}

function evaluateLockPlatform(claim: ToolClaim, evidence: PixiEvidence): ToolFinding {
  if (evidence.lockedPlatforms === undefined) {
    return {
      claimId: claim.id,
      verdict: "unavailable",
      evidenceState: "unavailable",
      detail: `${claim.environment} has no committed pixi.lock, so a claim about what it solved cannot be checked`,
    };
  }
  const observed = evidence.lockedPlatforms.join(", ");
  if (evidence.lockedPlatforms.includes(claim.asserted)) {
    return { claimId: claim.id, verdict: "exists", evidenceState: "observed", observed };
    }
  return {
    claimId: claim.id,
    verdict: "wrong-value",
    evidenceState: "observed",
    severity: "error",
    observed,
    detail: `note claims the lock solves ${claim.asserted}; the lock solves ${observed}`,
  };
}

function evaluateDependencyCount(claim: ToolClaim, evidence: PixiEvidence): ToolFinding {
  const observed = String(evidence.declaredDependencies.length);
  if (observed === claim.asserted) {
    return { claimId: claim.id, verdict: "exists", evidenceState: "observed", observed };
  }
  return {
    claimId: claim.id,
    verdict: "wrong-value",
    evidenceState: "observed",
    severity: "error",
    observed,
    detail: `note claims ${claim.asserted} package(s); pixi.toml declares ${observed} (${evidence.declaredDependencies.join(", ")})`,
  };
}

/**
 * A channel claim is about where this fixture's own packages come from, so it is answered by the
 * lock's resolved entries rather than by the manifest's channel list — every fixture here lists
 * both channels, so the manifest cannot distinguish them and would pass everything.
 */
function evaluatePackageChannel(claim: ToolClaim, evidence: PixiEvidence): ToolFinding {
  if (evidence.lockedPackages === undefined) {
    return {
      claimId: claim.id,
      verdict: "unavailable",
      evidenceState: "unavailable",
      detail: `${claim.environment} has no committed pixi.lock, so the channel its packages resolve from is unknown`,
    };
  }
  /**
   * A claim that names its package is answered by that package. Only the pin-spec shape in a
   * manifest header states a subject; prose channel claims do not, and are answered fixture-wide
   * below, which is a weaker question — it holds when *any* dependency resolves from the channel.
   */
  if (claim.subject !== undefined) {
    return evaluateNamedPackageChannel(claim, evidence, claim.subject);
  }

  const channelDependencies = evidence.declaredDependencies.filter(
    (name) => !evidence.pathDependencies.includes(name),
  );
  if (channelDependencies.length === 0) {
    return {
      claimId: claim.id,
      verdict: "unpinned",
      evidenceState: "absent",
      detail: `${claim.environment} declares only in-repo path recipes, so it takes no package from a channel`,
    };
  }
  const resolved = channelDependencies.map((name) => ({
    name,
    channel: evidence.lockedPackages?.get(canonicalPackageName(name))?.channel,
  }));
  /**
   * A dependency the lock does not account for is a gap in the evidence, never a finding. Scoring
   * it as a contradiction would let a reader of this file accuse a note of stating something the
   * note states correctly, on the strength of a package the reader failed to find.
   */
  const unresolved = resolved.filter(({ channel }) => channel === undefined).map(({ name }) => name);
  if (unresolved.length > 0) {
    return {
      claimId: claim.id,
      verdict: "unavailable",
      evidenceState: "unavailable",
      detail: `${claim.environment} declares ${unresolved.join(", ")}, which the lock does not resolve, so the channel its packages come from cannot be established`,
    };
  }

  const observedChannels = new Set(resolved.map(({ channel }) => channel as string));
  if (observedChannels.has(claim.asserted)) {
    return {
      claimId: claim.id,
      verdict: "exists",
      evidenceState: "observed",
      observed: [...observedChannels].join(", "),
    };
  }
  return {
    claimId: claim.id,
    verdict: "wrong-value",
    evidenceState: "observed",
    severity: "error",
    observed: [...observedChannels].sort().join(", "),
    detail: `note claims this fixture's package comes from ${claim.asserted}; the lock resolves ${resolved
      .map(({ name, channel }) => `${name} from ${channel}`)
      .join(", ")}`,
  };
}

function evaluateNamedPackageChannel(
  claim: ToolClaim,
  evidence: PixiEvidence,
  subject: string,
): ToolFinding {
  if (evidence.pathDependencies.map(canonicalPackageName).includes(subject)) {
    return {
      claimId: claim.id,
      verdict: "unpinned",
      evidenceState: "absent",
      detail: `${subject} is declared as an in-repo path recipe, so it comes from no channel`,
    };
  }
  const locked = evidence.lockedPackages?.get(subject);
  if (locked === undefined) {
    return {
      claimId: claim.id,
      verdict: "unavailable",
      evidenceState: "unavailable",
      detail: `${claim.environment} declares ${subject}, which the lock does not resolve, so the channel it comes from cannot be established`,
    };
  }
  if (locked.channel === claim.asserted) {
    return { claimId: claim.id, verdict: "exists", evidenceState: "observed", observed: locked.channel };
  }
  return {
    claimId: claim.id,
    verdict: "wrong-value",
    evidenceState: "observed",
    severity: "error",
    observed: locked.channel,
    detail: `note claims ${subject} comes from ${claim.asserted}; the lock resolves it from ${locked.channel}`,
  };
}

function evaluatePackageVersion(claim: ToolClaim, evidence: PixiEvidence): ToolFinding {
  if (evidence.lockedPackages === undefined) {
    return {
      claimId: claim.id,
      verdict: "unavailable",
      evidenceState: "unavailable",
      detail: `${claim.environment} has no committed pixi.lock, so ${claim.subject ?? "the package"}'s version cannot be checked`,
    };
  }
  const locked = claim.subject === undefined ? undefined : evidence.lockedPackages.get(claim.subject);
  /**
   * A package the fixture takes from an in-repo recipe cannot appear in the lock as a channel
   * artifact, so its absence there is the expected shape and not a contradiction. The recipe is the
   * authority for its version, and this checker does not read `recipes/` — so the claim is
   * unfalsifiable here rather than false, and must not be scored as a failure.
   */
  if (
    locked === undefined &&
    claim.subject !== undefined &&
    evidence.pathDependencies.map(canonicalPackageName).includes(claim.subject)
  ) {
    return {
      claimId: claim.id,
      verdict: "unpinned",
      evidenceState: "absent",
      detail: `${claim.subject} is declared as an in-repo path recipe, so no lock entry pins its version; the recipe is the authority and this audit does not read it`,
    };
  }
  if (locked === undefined) {
    return {
      claimId: claim.id,
      verdict: "absent",
      evidenceState: "absent",
      severity: "error",
      detail: `note names ${claim.subject ?? "a package"} ${claim.asserted}; the lock contains no such package`,
    };
  }
  if (locked.version === claim.asserted) {
    return { claimId: claim.id, verdict: "exists", evidenceState: "observed", observed: locked.version };
  }
  /**
   * A packaging suffix is the same upstream release, repackaged. `2.8.0` against a locked
   * `2.8.0.post1` is drift in what the note omitted, not a different version — so it is a warning
   * that stays visible without sitting in the queue beside a version the runtime contradicts.
   */
  const isPackagingSuffix =
    locked.version.startsWith(`${claim.asserted}.`) &&
    /^(?:post|dev|r|build)?\d*$/u.test(locked.version.slice(claim.asserted.length + 1));
  return {
    claimId: claim.id,
    verdict: "wrong-value",
    evidenceState: "observed",
    severity: isPackagingSuffix ? "warning" : "error",
    observed: locked.version,
    detail: isPackagingSuffix
      ? `note writes ${claim.subject} ${claim.asserted}; the lock pins ${locked.version}, the same release with a packaging suffix`
      : `note claims ${claim.subject} ${claim.asserted}; the lock pins ${locked.version}`,
  };
}
