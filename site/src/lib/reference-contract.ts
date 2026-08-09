import path from "node:path";

import {
  loadCastReferenceContract,
  type CastContract,
} from "@galaxy-foundry/cast";
import { type ReferenceContract } from "@galaxy-foundry/reference-contract";

const CONTRACT_FILE = path.resolve("../reference_contract.yml");

/** Cast modes are capabilities. This instance supports only unchanged note carry today. */
export const SUPPORTED_MODES = ["verbatim"] as const;

let cached: { contract: ReferenceContract; cast: CastContract } | undefined;

/** Both reader-facing and cast behavior from the one instance reference declaration. */
export function castReferenceContract(): {
  contract: ReferenceContract;
  cast: CastContract;
} {
  cached ??= loadCastReferenceContract(CONTRACT_FILE, {
    narrow: { modes: SUPPORTED_MODES },
  });
  return cached;
}

export function referenceContract(): ReferenceContract {
  return castReferenceContract().contract;
}
