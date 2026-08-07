# Package

A Package note profiles one upstream software project that the Foundry may evaluate, package, or
expose through Galaxy. The note describes the software; it is not the runnable Environment or the
Recipe used to build it.

Required fields:

- `type: package`
- `title`: the project's display name
- `summary`: short reader-facing description
- `repository`: canonical upstream source repository
- `languages`: one or more implementation languages
- `software_license`: either a declared SPDX/custom license id or an explicit `missing` status
- `tags`: at least one registered domain facet tag

Method relationships and upstream-health observations remain in prose for now. They become typed
only when a real Method collection and a consumer for time-sensitive health evidence exist.
