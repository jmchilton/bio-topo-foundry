# Environment

An Environment note is one runnable biopixi fixture: a directory whose `pixi.toml` assembles
packages and their dependencies into a configuration that installs and runs. The note describes
that configuration. The upstream software it assembles is a Package, and the two are separate kinds
because a Package is abstract — code to read, evaluate, and wrap — while an Environment is
composite and actionable.

This is the first directory-shaped kind. The manifest is the note's companion, not its content, so
`index.md` never restates what `pixi.toml` already declares.

Required fields:

- `type: environment`
- `title`: the fixture's display name, matching its directory
- `summary`: short reader-facing description
- `portability_grade`: the anticipated biopixi grade, `L0` through `L4`
- `tags`: at least one registered domain facet tag

Optional:

- `publication_candidate`: the container the fixture would publish as, and the state of the
  evidence for it — `state` plus `uri`, and for `CONFIRMED` also the manifest `digest` and the
  `observed_at` instant

`portability_grade` is *anticipated*, not declared: the grader derives a grade from the manifest,
lockfile, and public channel metadata, so a note records what the fixture is expected to score and
is corrected by running the grader. It grades packaging, never science — an L4 fixture is portable,
which says nothing about whether the method inside it is sound.

L4 is the exception to *anticipated*, and the reason `publication_candidate` is a field rather than
prose. Every other level can be derived from files this repository holds; L4 asserts that an image
is at a registry, which no file records. So the schema requires an L4 note to carry a `CONFIRMED`
candidate — an image that answered an anonymous pull, with its digest and the time of the
observation. A single Bioconda package makes a container *likely*, which is the `INFERRED` state:
eligible for L4, not evidence of it.

A grade ceiling and the route past it belong in prose, because they are arguments rather than
facts. "L1 today, L3 once the recipe is on Bioconda" is a claim about future packaging work, and it
would go stale silently in frontmatter.

Whether a fixture is locked is not a field. `pixi.lock` is a declared companion, so its presence is
read from the directory and can never disagree with the note. Which upstream Package a fixture
assembles stays a body wiki link until a Mold actually resolves that dependency; a typed reference
is what the Reference vocabulary is for, and no consumer needs one yet.
