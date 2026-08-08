# Method

A Method note is this Foundry's account of one technique — what it computes, what it costs, when to
reach for it, and which papers, packages, and environments here belong to it. It is the landing note
for one value of the `method` facet.

Required fields:

- `type: method`
- `title`: the note's display name
- `summary`: short reader-facing description
- `facet_tag`: the `method/` facet value this note anchors
- `tags`: at least one registered domain facet tag, including `facet_tag` itself

## What separates it from the neighbouring kinds

A Paper note reviews **one external work** and is governed by that work's license: it carries
`source_license` and a `derived` posture because it describes someone else's expression. A Package
note profiles **one upstream project**. A Method note describes **a technique**, which no one owns
and no single paper exhausts — so it has no source, no license posture, and no repository. It is
Foundry prose throughout, and the absence of those fields is the point rather than an omission.

The practical test: if the note would have to change when a specific paper is retracted or a
specific project is archived, it is a Paper or Package note. A Method note cites many sources and
survives any one of them.

## Why `facet_tag` is a field and not a convention

The obvious alternative is to match the note's filename against the tag's last segment, so that
`methods/persistent-homology.md` implicitly anchors `method/persistent-homology`. That works right
up until someone renames a file or a tag, at which point the link is silently gone and nothing
fails. Declaring the tag makes it checkable, and it is checked twice: the value must belong to the
`method` facet, and the note must carry it among its own `tags`.

The second check exists because its failure mode is the quiet one. A note whose `facet_tag` names a
tag it does not itself carry is absent from the tag page it was written to head — every other note
about the technique is listed there, and the one explaining the technique is not.

## What a Method note owes the reader

A technique is worth a note here when the corpus already assumes it. The note should say what the
method computes and what it discards, what it costs, what it needs from the data, how to tell it
apart from its nearest neighbour, and where the honest limits are — including which of its
guarantees come from papers this corpus has not reviewed. Naming what is *not* settled is part of
the job; a method note that reads like an advertisement is not doing it.

Linking is the other half. A Method note is the hub: it links up to the Paper notes that define and
survey it, and down to the Package notes implementing it and the Environment fixtures that run
them. A tag page lists everything sharing a tag; the Method note explains why those things belong
together.
