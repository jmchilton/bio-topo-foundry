# Paper

A Paper note is this Foundry's review of one external paper or survey. It links to the source and
reviews it; it does not reproduce it. The note describes someone else's scholarship, which is what
separates it from a Manuscript (research we author) and from a Package (our profile of external
software).

Required fields:

- `type: paper`
- `title`: the note's display name, which is ours and need not repeat the source's title
- `summary`: short reader-facing description
- `citation`: authors, source title, and identifier for the external work
- `source_url`: canonical link to the external work
- `source_license`: either a declared license id for the source or an explicit `missing` status
- `derived`: the summary posture, `own-words-summary` or `license-aware-summary`
- `tags`: at least one registered domain facet tag

`source_license` is the license of the reviewed work, never of the software that may accompany it.
An article and its repository routinely differ, so a Package note's `software_license` and a Paper
note's `source_license` are separate facts even when both describe the same project.

`derived` is checked against `source_license`, not merely recorded. A note may always summarize in
its own words; it may only claim `license-aware-summary` when the source's row in the shared
license-policy table permits carrying upstream expression. A missing license resolves
deny-by-default and therefore forecloses that posture.

DOIs, venue, and publication dates stay in prose for now. They become typed when a citation or
reference consumer needs them, on the same terms as the deferred Package fields.
