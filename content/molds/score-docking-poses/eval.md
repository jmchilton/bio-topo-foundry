# Score docking poses evaluation

These properties judge any run of the `score-docking-poses` Mold. Concrete benchmark inputs and
expected measurements belong in `scenarios.md`.

## Property: candidates are accounted for without changing the structures

- bucket: integrity
- check: deterministic
- assertion: every input candidate appears exactly once in the score table, either with a score and
  one unique contiguous rank or with an explicit failure; selected structures are byte-identical to
  their inputs.

## Property: ranking is target-local and label-blind

- bucket: fidelity
- check: deterministic
- assertion: candidates from different targets are never ranked together, and native-reference
  labels such as measured DockQ are unavailable to featurization, scoring, sorting, and top-k
  selection.

## Property: conclusions stay within interface quality assessment

- bucket: interpretation
- check: llm-judged
- assertion: the result is described as a predicted, target-relative interface-quality ranking. It
  is not presented as measured DockQ, binding affinity, experimental validation, or proof that the
  selected structure is biologically correct.
