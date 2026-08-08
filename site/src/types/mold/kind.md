# Mold

A Mold describes one abstract action. Its body gives the procedure and its `references` manifest
states which Foundry notes a cast consumes, when it consumes them, and how they are carried.

Only `index.md` bears frontmatter. Two recommended, Foundry-only companions can sharpen the
contract without entering a cast bundle:

- `eval.md` records the properties a successful cast must satisfy.
- `scenarios.md` binds concrete cases to those properties.

Required fields:

- `type: mold`
- `name`: the stable slug used by routes, wiki links, and cast artifacts
- `summary`: a reader-facing description between 20 and 160 characters
- `tags`: at least one registered domain facet tag

`references` is optional because an action can be named before its dependencies are known. Each
entry draws its controlled terms from `reference_contract.yml` and the installed shared contract.
An `on-demand` reference requires a `trigger`; a `hypothesis` requires a `verification`; unknown
fields are rejected.
