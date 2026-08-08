---
type: package
title: open-topodockq-featurizer
summary: The MIT clean-room TopoDockQ interface featurizer, bit-exact against the bytecode-only original it replaces.
repository: https://github.com/jmchilton/open-topodockq-featurizer
languages:
  - Python
software_license:
  status: declared
  id: MIT
tags:
  - method/persistent-laplacian
  - application/structure-qa
  - modality/molecular-structure
---

# open-topodockq-featurizer

This library emits the interface descriptor TopoDockQ's scorer consumes: a raw 2,754-value,
channel-major vector over nine ordered element pairings between the protein side and the peptide
side, each carrying Betti-death bins, Rips barcode summaries, persistent-Laplacian spectral
statistics across thirty-three filtration values, and alpha-complex bars. It is a featurizer and
nothing more — the scorer it feeds is upstream's, unchanged.

## Why it was written

Because of an asymmetry rather than a blanket licensing failure. [[topodockq]] releases its scorer
as open MIT source: the model, the training script, and the two inference stages are all readable.
Its featurizer is not. That one component is distributed only as CPython bytecode, in a separate
repository that displays no license, and it sits at the head of the pipeline.

One closed link closes the whole chain. Nothing downstream of the featurizer can be run on a new
structure, ported to a supported interpreter, audited, or fixed, however open the rest is. This
package replaces exactly that link and nothing else, which is what turns the gap from documented
into closed: the open scorer's inputs no longer require any bytecode.

## How it is known to be right

The method was recovered by black-box observation — command-line sweeps, instrumented input and
output, and controlled synthetic structures. The bytecode was never decompiled and nothing was
copied from the upstream repository. Behavior is not copyrightable; the pinned constants are facts
read off observed output.

Because a working original existed to compare against, the evidence available here is the strongest
in this corpus. The featurizer reproduces the shipped features bit-exactly on four hundred real
interface structures spanning four hundred distinct PDB entries, at a maximum absolute difference
around 10⁻¹¹, and end to end its output drives the unchanged upstream scorer to a bit-identical
prediction.

At-scale parity on real data is still not sufficient on its own, and the reason is instructive. The
upstream corpus is uniformly clean, so whole input paths are never exercised by it. Six synthetic
probes cover those — an empty side, a single-atom side, heteroatom records, blank element fields, an
extra chain — each checked against an oracle minted from the original. Building them surfaced four
bugs that four hundred real structures could not reach, all of them dormant on real data. Parity
before and after the fixes is byte-identical, which is precisely why only the probes could find
them.

The honest remainder is that the zero-eigenvalue tolerance is not independently pinned. No probe
forces an eigenvalue near it, and real data is insensitive to its value across any sane range.

The contrast with [[open-topoqa-featurizer]] is worth keeping in view. Both are clean-room; that
sibling was written from a paper with no oracle to check against, and its evidence stops at spec
conformance and invariants. Same posture, very different ceilings.

## What it does not do

It does not score. It does not reproduce the column mask that reduces the raw vector to the model's
inputs — that mask is derived from the training split and applied inside upstream's own inference
stage, so it is upstream's to own. It does not supply a scaler, because upstream serializes none and
refits one from the training table at inference time. Anyone assembling the full pipeline still
needs upstream's published data record for both.

It is also not a general persistent-Laplacian library. The spectra come from [[petls-pytorch]], and
specifically from the fork, because the bipartite interface complexes this builds put isolated
vertices into the simplex tree and the stock release dropped them when extracting boundaries. That
defect is the reason the fork exists.

## In this corpus

[[open-topodockq-featurizer-recipe]] builds it and [[open-topodockq-featurizer-environment]] pins a
runtime around it and the engine beneath it; both are authority for versions and dependencies. The
technique is [[persistent-laplacian]] and the subject it completes is [[topodockq]].
