# Score docking poses scenarios

The motivating case follows the experiment in [[topoqa]]: score an ensemble of candidate complex
structures without consulting the native structure, rank candidates within each target, and reveal
reference DockQ values only afterward to evaluate model selection. The independent
[[topoqa-interface-quality]] study records the paper and released-checkpoint results that anchor the
comparison.

## Case: paper-shaped interface-ranking benchmark

- fixture: the paper-filtered DBM55-AF2 benchmark (15 targets, 449 decoys) and HAF2 benchmark (12
  targets after excluding 7ALA), with candidate structures grouped by target and reference DockQ
  labels held out during scoring.
- run: invoke the Mold separately for each target, retaining every candidate in its result, then
  join the completed rankings to the held-out labels for evaluation.
- expect: one complete target-local score table and top-k selection per target; mean per-target
  ranking loss computed as the best available DockQ minus the DockQ of the top-ranked candidate;
  pooled and mean per-target correlations reported as different measurements rather than conflated.
- interpretation: this open scorer is a clean-room retrain, not the paper's released checkpoint, so
  the paper's reported ranking losses (0.069 on DBM55-AF2 and 0.110 on HAF2) are comparison anchors,
  not acceptance thresholds. The scenario passes when the evaluation design and output integrity
  satisfy `eval.md`; scientific performance is reported rather than forced to match upstream.
