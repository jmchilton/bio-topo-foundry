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

  lines.push("# Skill–tool alignment audit", "");
  lines.push(
    "Runtime claims in environment notes, checked against the pixi manifest and lock committed",
    "beside them. Nothing here solves, fetches, or executes: the lock is the record of a solve that",
    "already happened, so every verdict is reproducible offline.",
    "",
  );

  lines.push(`- Claims checked: **${summary.total}**`);
  lines.push(`- Holds: **${summary.byVerdict.exists}**`);
  lines.push(`- Contradicted by the runtime: **${summary.byVerdict["wrong-value"]}**`);
  lines.push(`- Names something the runtime lacks: **${summary.byVerdict.absent}**`);
  lines.push(`- Not falsifiable (\`unpinned\`): **${summary.byVerdict.unpinned}**`);
  lines.push(`- Not checkable (\`unavailable\`): **${summary.byVerdict.unavailable}**`);
  lines.push(
    `- Declined by a pre-filter: **${summary.coverage.declined}** (a recognized token the grammar refused to promote)`,
  );
  lines.push("");
  lines.push(
    "The last figure is part of the result, not a footnote. A rate describes only the claims the",
    "extractor could read, and one that does not say how much it read is a number nobody can size.",
    "",
  );

  const flagged = run.findings.filter(
    ({ verdict }) => verdict === "wrong-value" || verdict === "absent",
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

  return `${lines.join("\n").trimEnd()}\n`;
}
