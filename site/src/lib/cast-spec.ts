import type { CastCommandSpec } from "@galaxy-foundry/cast/command";

import { DEFINITIONS } from "../types";
import { readCastCorpus } from "./cast-corpus";
import { TDA_CAST_HOOKS } from "./cast-hooks";
import { SUPPORTED_MODES } from "./reference-contract";

export const DEFAULT_CAST_TARGET = "claude";

/** The complete instance contribution consumed by both one-Mold casting and the drift sweep. */
export const TDA_CAST_SPEC: CastCommandSpec = {
  usage: "pnpm cast",
  defaultTarget: DEFAULT_CAST_TARGET,
  contractPath: "reference_contract.yml",
  narrow: { modes: SUPPORTED_MODES },
  hooks: TDA_CAST_HOOKS,
  corpus: readCastCorpus,
  kindLayouts: DEFINITIONS,
};
