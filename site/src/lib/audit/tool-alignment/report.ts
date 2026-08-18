import type { ToolAlignmentRun } from "./audit";

/**
 * Render the run as a vector, never a composite.
 *
 * A single number would hide the thing worth seeing: a fixture can carry a contradicted channel
 * claim while every version it states is correct, and averaging the two describes neither. Each
 * partition therefore reports its own count, and `unpinned` and `unavailable` stay outside the
 * failure partitions rather than being coerced into them to make fixtures comparable.
 */
export function renderToolAlignmentMarkdown(run: ToolAlignmentRun): string {
  const { summary } = run;
  const claimById = new Map(run.claims.map((claim) => [claim.id, claim]));
  const lines: string[] = [];

  lines.push("# Environment runtime-claim audit", "");
  lines.push(
    "Runtime claims in environment notes and in the header comment of the manifest beside them,",
    "checked against that manifest and its lock. Nothing here solves, fetches, or executes: the",
    "lock is the record of a solve that already happened, so every verdict is reproducible offline.",
    "",
    "This is the Skill Integrity Audit's S2 for this Foundry. It audits what a fixture asserts about",
    "its own runtime, not whether a cast skill invokes the tool correctly.",
    "",
  );

  lines.push(`- Extracted: **${summary.extracted}**`);
  // Which file a claim came from is worth reporting: the two describe one runtime, and a corpus
  // where only one of them is ever read is a corpus with an unaudited half.
  for (const [artifactKind, count] of countByArtifact(run)) {
    lines.push(`  - from \`${artifactKind}\`: **${count}**`);
  }
  if (summary.withdrawn > 0) {
    lines.push(`- Withdrawn on review as extractor defects: **${summary.withdrawn}**`);
  }
  lines.push(`- Assessed: **${summary.assessed}**`);
  lines.push(`- Holds: **${summary.byVerdict.exists}**`);
  lines.push(`- Contradicted by the runtime: **${summary.byVerdict["wrong-value"]}**`);
  lines.push(`- Names something the runtime lacks: **${summary.byVerdict.absent}**`);
  lines.push(`- Not falsifiable (\`unpinned\`): **${summary.byVerdict.unpinned}**`);
  lines.push(`- Not checkable (\`unavailable\`): **${summary.byVerdict.unavailable}**`);
  lines.push(`- Recognized tokens declined by a pre-filter: **${summary.recognizedTokensDeclined}**`);
  lines.push("");
  lines.push(
    "Every rate here is over **assessed**, not over everything extracted: a claim review struck as",
    "an extractor defect was never a claim, and letting it score as one would let the instrument",
    "improve its own numbers by misreading more prose.",
    "",
    "The last figure counts tokens the grammar recognized and refused to promote. It is not a",
    "coverage measure, and no number here can be one — a claim written in a shape the grammar does",
    "not know produces no token at all, so nothing counts it and nothing here would reveal it.",
    "",
  );

  const flagged = run.findings.filter(
    ({ effectiveVerdict, withdrawn }) =>
      !withdrawn && (effectiveVerdict === "wrong-value" || effectiveVerdict === "absent"),
  );

  if (flagged.length === 0) {
    lines.push("## Findings", "", "No claim was contradicted by the runtime it names.", "");
  } else {
    lines.push("## Findings", "");
    lines.push("| Claim | Where | Verdict | Severity | Detail |");
    lines.push("| --- | --- | --- | --- | --- |");
    for (const finding of flagged) {
      const claim = claimById.get(finding.claimId);
      const where = claim
        ? `\`${claim.span.artifactPath}:${claim.span.startLine}\``
        : finding.claimId;
      lines.push(
        `| ${claim?.kind ?? "?"} | ${where} | \`${finding.effectiveVerdict}\` | ${
          finding.severity ?? "—"
        } | ${finding.detail} |`,
      );
    }
    lines.push("");
    for (const finding of flagged) {
      const claim = claimById.get(finding.claimId);
      if (claim === undefined) continue;
      lines.push(`### \`${claim.span.artifactPath}:${claim.span.startLine}\` — ${claim.kind}`, "");
      lines.push(`> ${claim.context}`, "");
      lines.push(`${finding.detail}.`, "");
    }
  }

  lines.push("## Review", "");
  lines.push(
    `${summary.review.completed} of ${summary.review.required} flagged findings carry a reviewed decision.`,
    "",
  );

  // A decision that changes a number has to be legible beside the number it changed, or the run
  // reports a rate whose reason lives only in a separate file.
  const decided = run.findings.filter(({ adjudication }) => adjudication !== undefined);
  if (decided.length > 0) {
    lines.push("| Claim | Where | Machine | Decision | After review |");
    lines.push("| --- | --- | --- | --- | --- |");
    for (const finding of decided) {
      const claim = claimById.get(finding.claimId);
      const where = claim
        ? `\`${claim.span.artifactPath}:${claim.span.startLine}\``
        : finding.claimId;
      const after = finding.withdrawn ? "withdrawn" : `\`${finding.effectiveVerdict}\``;
      lines.push(
        `| ${claim?.kind ?? "?"} | ${where} | \`${finding.verdict}\` | ${finding.adjudication} | ${after} |`,
      );
    }
    lines.push("");
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

function countByArtifact(run: ToolAlignmentRun): [string, number][] {
  const counts = new Map<string, number>();
  for (const claim of run.claims) {
    counts.set(claim.span.artifactKind, (counts.get(claim.span.artifactKind) ?? 0) + 1);
  }
  return [...counts].sort(([left], [right]) => left.localeCompare(right));
}
