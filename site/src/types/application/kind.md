# Application

An Application note is this Foundry's account of one biological problem: what the task is, how it
is scored, what currently does it best, and where topological methods sit against that evidence.

Required fields:

- `type: application`
- `title`: the problem's display name
- `summary`: short reader-facing description
- `assessed`: the ISO date on which the moving state-of-the-art synthesis was last evaluated
- `tags`: at least one registered domain facet tag

Optional field:

- `facet_tag`: the `application/` facet value this note anchors, when the page and tag have exactly
  the same granularity

## Why this is not a Paper or Method note

A Paper note reviews one external work. A Method note explains one technique. An Application note
compares techniques and evidence around one problem, including non-topological competitors and
facts no single source owns: which target practitioners actually care about, which evaluation
protocols are commensurable, and whether topology is ahead, competitive, or behind. It survives
the replacement of any one paper or model even though its dated state-of-the-art section changes.

## Why `assessed` is required

The problem definition and evaluation traps should be durable; the best available model is not.
`assessed` makes every present-tense synthesis explicitly time-bounded. It does not replace
citations: every load-bearing external claim still names its primary source.

## Why `facet_tag` is optional

Application pages may be narrower than the browse vocabulary. A tag needs enough notes to make a
useful axis; a problem page needs only a coherent task, target, and evaluation practice. Requiring
one page for every broad `application/` member would turn a browsing taxonomy into a content
backlog, while requiring a new tag for every page would make the vocabulary too fine to browse.

When a page does align exactly with a facet value it may declare `facet_tag`. The schema then checks
that the value belongs to the `application` facet and that the note carries the tag it claims to
anchor. Corpus conformance also rejects two Application notes claiming the same anchor. It does not
require every application tag to have a landing note.

## What an Application note owes the reader

Start with the property or task in working terms. Separate proxies that measure different things,
state the metric and split, and name protocol choices that make reported numbers incomparable.
Date the state of the art, include serious non-TDA baselines, and say plainly what topology buys —
including when the evidence says it buys nothing yet.
