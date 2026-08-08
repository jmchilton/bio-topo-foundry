import path from "node:path";

import {
  buildReferenceContract,
  loadInstanceKinds,
  type ReferenceContract,
} from "@galaxy-foundry/reference-contract";

const CONTRACT_FILE = path.resolve("../reference_contract.yml");

/** Cast modes are capabilities. This instance supports only unchanged note carry today. */
export const SUPPORTED_MODES = ["verbatim"] as const;

let cached: ReferenceContract | undefined;

export function referenceContract(): ReferenceContract {
  cached ??= buildReferenceContract({
    kinds: loadInstanceKinds(CONTRACT_FILE),
    narrow: { modes: SUPPORTED_MODES },
  });
  return cached;
}
