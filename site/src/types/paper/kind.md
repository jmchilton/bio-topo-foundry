# Paper

A Paper note is this Foundry's review of one external paper or survey. It links to the source and
reviews it; it does not reproduce it. The note describes someone else's scholarship, which is what
separates it from a Manuscript (research we author) and from a Package (our profile of external
software).

Most of the frontmatter is the shared source-note contract from
[`@galaxy-foundry/source-note`](https://www.npmjs.com/package/@galaxy-foundry/source-note), which
this kind spreads rather than restates. Required fields:

- `type: paper`
- `title`: the note's display name, which is ours and need not repeat the source's title
- `summary`: short reader-facing description
- `citation`: authors, source title, and identifier for the external work
- `source_url`: canonical link to the external work
- `source_ids`: the identifiers the work is addressable by, or `status: none` with a reason
- `access_date`: the quoted `YYYY-MM-DD` on which the source was read
- `source_read`: how much of it was read — `full-text`, `partial`, or `abstract-only`
- `source_license`: either a declared license id for the source or an explicit `missing` status
- `derived`: the summary posture, `own-words-summary` or `verbatim-quotes-summary`
- `tags`: at least one registered domain facet tag

Optional: `oa_url` for a free mirror of a paywalled record, `version` for the edition summarized,
`attribution` and `license_file` where carrying upstream expression obliges them, and
`license_statement` where the source's wording is the evidence for its id.

`source_license` is the license of the reviewed work, never of the software that may accompany it.
An article and its repository routinely differ, so a Package note's `software_license` and a Paper
note's `source_license` are separate facts even when both describe the same project.

`derived` is checked against `source_license`, not merely recorded. A note may always summarize in
its own words; it may only claim `verbatim-quotes-summary` when the source's row in the shared
license-policy table permits carrying upstream expression, and then only with the `attribution`
notice and the vendored `license_file` that row obliges. A missing license resolves deny-by-default
and therefore forecloses that posture.

`source_ids` carries identity; `source_url` carries a location. A DOI belongs in the first even when
it also appears inside the second, because a URL addresses one copy through one host and the host is
the part that rots. Identifiers are bare — `10.1002/cnm.3376`, not `https://doi.org/10.1002/cnm.3376`
— and a work that genuinely has none says so with `status: none` and a reason, so that an unresolved
source is a reviewable claim rather than a silent omission.

`source_read` is testimony rather than something a checker can verify, and it is required precisely
because silence used to read as `full-text`. A summary built from an abstract cannot support a claim
about methods or results detail, and the field is what makes that visible.
