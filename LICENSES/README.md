# Vendored upstream license texts

Verbatim copies of the licenses under which this repository redistributes **someone else's
expression**. Nothing here grants anything over this repository's own contents — that is the root
`LICENSE`, and it is MIT.

A file lands here only because a note carries upstream wording under it. A note that summarizes in
its own words redistributes no expression, so it obliges no copy and adds no file.

## Naming

A standard license shared across notes is named for its SPDX id, `CC-BY-4.0.LICENSE`. A copy
specific to one source is named for that source, `msmb.LICENSE`, because two sources under one
license vendor two files. The stem is therefore the id of a *copy*, never the id of a license, and
`@galaxy-foundry/license-policy` names the two types apart for exactly that reason.

A note declares one as a path:

```yaml
derived: verbatim-quotes-summary
license_file: LICENSES/CC-BY-4.0.LICENSE
attribution: ...
```

## No inventory here

Which copies exist, and which notes carry under each, is generated at `/licenses/` from the
frontmatter and this directory. This file does not list them: a hand-maintained second copy of a
tree is the failure mode this repository has already retired once.

Both directions are checked. `site/tests/license-files.test.ts` runs `auditLicenseFiles` over the
corpus, so a declared copy that is absent, a copy nothing declares, and a path that resolves by
basename from outside this directory each fail the build. `content/meta/content-model.md` owns the
rule the check enforces; `content/meta/repository-layout.md` owns why this directory is top-level.
