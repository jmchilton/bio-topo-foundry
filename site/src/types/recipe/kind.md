# Recipe

A Recipe note is one rattler-build recipe kept in this repository, under `recipes/<slug>/`. The
recipe exists because a public conda channel does not supply the package, and the note says which
gap it closes, whether anyone has actually built it, and what stands between it and a channel.

Required fields:

- `type: recipe`
- `title`: the recipe's display name, matching its directory under `recipes/`
- `summary`: short reader-facing description
- `gap`: `absent` or `stale` — what the channels fail to supply
- `build`: `{ status: verified, platforms: [...] }` or `{ status: unverified }`
- `upstreaming`: `blocked`, `eligible`, `submitted`, or `published`
- `tags`: at least one registered domain facet tag

`submission` is a URL, and is required by exactly the two states that assert one exists.

## Why the note is file-shaped

Every other packaging kind here is directory-shaped, and this one is not. The recipe's real files —
`recipe.yaml`, `pixi.toml`, sometimes `variants.yaml` — live at `recipes/<slug>/`, outside
`content/`, because a dozen fixture manifests reach them as `../../../recipes/<slug>` path
dependencies. Companions describe a note's own directory, so declaring those files as companions
would describe a layout that does not exist. Copying them into `content/recipes/<slug>/` would
create a second copy to drift.

So the note is `content/recipes/<slug>.md`, and its recipe is found by name. A test walks both
directions of that correspondence, which is what a companion declaration would have bought.

## What the note does not restate

`recipe.yaml` declares the package name, version, license, homepage, source URL, and every
dependency. None of that is repeated here. A note that carried a version would be a second place to
update it, and the one that got missed would be this one.

`gap` is not derivable from the recipe file, which is why it is a field. `absent` means the package
is on no public conda channel at all, which covers most of this set. `stale` means a channel does
carry it and the build there is too old to use — one recipe, `topometry`, where conda-forge stops
at `0.2.1.1` and the published workflow needs the `1.1.0` API.

## Verified means someone ran it

`build.status` records whether `rattler-build` has actually produced a package, not whether the
recipe looks right. Three recipes are `unverified`, and that is the useful part: it makes "which of
these has never been built?" a query rather than an archaeology exercise.

`platforms` lists where the build was exercised, not where the package works. A noarch package
verified on `osx-arm64` runs everywhere; the field says what was tested, and the prose says what
that implies.

## Upstreaming is a licence question first

`blocked` is not a scheduling state. It means the licence forecloses publication, because
conda-forge and Bioconda both require a bundled OSI licence and no amount of recipe work substitutes
for one. `petls` is the case: it declares no licence anywhere, so it is all rights reserved by
default and its recipe will never leave this repository. A test ties this to the recipe file, so a
`LicenseRef-` licence and an `eligible` claim cannot coexist.

`eligible` is the ordinary state — redistributable, and nobody has opened the PR. `submitted` and
`published` both assert something a reader would act on, so both must carry the link.
