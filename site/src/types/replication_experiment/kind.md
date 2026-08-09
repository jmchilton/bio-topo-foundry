# Replication experiment

A Replication experiment note records a bounded study this Foundry ran to test claims made by an
external paper or package. The executable experiment — code, protocol, inputs, results — lives in a
standalone repository. This note pins one revision of that repository, says what came out, and
connects the work to the packages, methods, and papers it touches.

Required fields:

- `type: replication_experiment`
- `title`: the study's display name
- `summary`: short reader-facing description
- `artifact`: the pinned repository, with `repository` and a full `revision`
- `arc`: the stages actually run, drawn from `replicate`, `harden`, `extend`
- `status`: `planned`, `running`, `complete`, `blocked`, or `superseded`
- `redistribution`: `open`, `restricted`, `mixed`, or `noassertion`
- `tags`: at least one registered domain facet tag

Optional: `replication_outcome`, `environment`, `artifact.protocol`,
`artifact.evidence_manifest` — with conditions, below.

The `harden` stage in `arc` means making a *claim* reliable without changing its scientific intent.
It is a different axis from hardening in the sense the rest of the Foundry uses — making software
installable and reproducible — and the two happen to share a word. This enum is the checked one.

Working practice for running these studies is a separate document:
`content/meta/replication-experiments.md`.

## What separates it from the neighbouring kinds

A Paper note reviews someone else's work. A Package note profiles someone else's software. A
Replication experiment reports **what happened when we ran it** — it is the only kind in the corpus
whose subject is this Foundry's own evidence.

That makes it the closest thing here to original scholarship, and it is deliberately not a
`manuscript`. A manuscript advances a claim of ours; a replication tests a claim of theirs. The two
demand different things of the reader, and collapsing them would let "we checked this" quietly read
as "we found this."

The practical test: if the note's central content is a number *we produced*, it is a replication
experiment. If it is a number *they reported*, it belongs in the Paper or Package note.

## Why the repository is pinned by full commit id

`artifact.revision` must be a full 40-character commit id. Branch names move and abbreviations
collide, so a note pinned to `main` describes whatever that repository contains when the reader
arrives — which may be nothing like what produced the numbers above it. The design draft states the
rule directly: moving branch names are not sufficient evidence identifiers. This is the one place
in the note where a plausible-looking value silently destroys the note's whole purpose, so it is
the one place with a format check.

## Why `status: complete` demands an environment

A study is complete when the evidence has been produced *here*, through a biopixi fixture recorded
in this Foundry — not when the upstream repository stops changing.

The distinction sounds pedantic and is not. All three of the studies in this corpus have finished
upstream work and written-up findings, and none of them has been re-run through a fixture here.
Without the check, each would read as settled while the only thing that would make it reproducible
for a reader is precisely what is missing. So `environment` is optional in the schema and required
by `complete`: a study whose fixture does not exist yet is unfinished, not invalid.

`replication_outcome` is required by `complete` for the same reason — a finished study that never
says how it came out is not finished.

## Relationships live in the body, not the frontmatter

The design draft's first sketch put `replicates[]`, `evaluates[]`, `uses[]`, and `informs[]` in
frontmatter as wiki-link arrays. They are carried as body links instead, for a mechanical reason:
body wiki-links are resolved and checked at build time, so a link to a note that does not exist
fails; a frontmatter string is never resolved and would dangle silently. Moving the relationships
into prose makes them *more* checked, not less.

There is a content reason too. None of the three papers under test has a Paper note — each is
reviewed inside its Package note — so a required `replicates[]` pointing at Paper notes would have
been unsatisfiable on the day the kind landed. Add the typed fields when the notes they would point
at exist, and when something other than a reader needs to traverse them.

`arms[]` is left out on the same grounds: every study here has one arm per arc stage, so per-arm
frontmatter would encode structure the corpus does not yet have. The arc records which stages ran;
the body says what each one did.

## What a note owes the reader

Say what claim was tested and what came out, including the parts that did not reproduce. Name the
deviations from the paper's stated protocol, since those are usually where a gap comes from. State
what is redistributable and what is not — code, data, and weights routinely differ, which is why
`redistribution` summarizes the bundle rather than the code license. And say what would have to
happen for the study to be complete, because for now that is the most useful thing a reader can
learn from it.
