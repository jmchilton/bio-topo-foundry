---
type: replication_experiment
title: Example replication
summary: A small example showing the minimum metadata required to pin one replication study and its evidence.
artifact:
  repository: https://github.com/jmchilton/example-replication
  # Quoted: an all-digit commit id is a YAML integer, and loses its leading zeros on the way in.
  revision: "0000000000000000000000000000000000000000"
arc:
  - replicate
status: running
redistribution: open
tags:
  - method/persistent-homology
---

# Example replication

The body names the claim under test, what came out, and where the numbers disagree with the paper.
It links to the Package and Method notes the study touches, and says what remains before the study
could be called complete — here, a biopixi fixture that re-runs the pinned repository.
