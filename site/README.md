# Foundry reader

The typed reader and validation surface for this Foundry's corpus.

```sh
pnpm install
pnpm validate
```

This file deliberately describes nothing else. What used to be here — the kind roster, the shared
package boundary, the check inventory — is now owned by the infrastructure design records, which
are typed notes and therefore checked:

- `content/meta/code-architecture.md` — components, dependency seams, deliberate absences
- `content/meta/content-model.md` — kinds, frontmatter, tags, links, references, companions
- `content/meta/repository-layout.md` — where files belong and what that implies
- `content/meta/build-and-validation.md` — commands, generators, gates, CI

They render at `/design/`. This file went stale describing three kinds while the corpus had seven,
which is the argument for the records owning it: a change routes to exactly one of them, and none
of them can drift without failing a check.
