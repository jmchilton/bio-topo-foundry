# Environment runtime-claim audit

Runtime claims in environment notes, checked against the pixi manifest and lock committed
beside them. Nothing here solves, fetches, or executes: the lock is the record of a solve that
already happened, so every verdict is reproducible offline.

This is the Skill Integrity Audit's S2 for this Foundry. It audits what a note asserts about
its own runtime, not whether a cast skill invokes the tool correctly.

- Extracted: **27**
- Assessed: **27**
- Holds: **27**
- Contradicted by the runtime: **0**
- Names something the runtime lacks: **0**
- Not falsifiable (`unpinned`): **0**
- Not checkable (`unavailable`): **0**
- Recognized tokens declined by a pre-filter: **31**

Every rate here is over **assessed**, not over everything extracted: a claim review struck as
an extractor defect was never a claim, and letting it score as one would let the instrument
improve its own numbers by misreading more prose.

The last figure counts tokens the grammar recognized and refused to promote. It is not a
coverage measure, and no number here can be one — a claim written in a shape the grammar does
not know produces no token at all, so nothing counts it and nothing here would reveal it.

## Findings

No claim was contradicted by the runtime it names.

## Review

0 of 0 flagged findings carry a reviewed decision.
