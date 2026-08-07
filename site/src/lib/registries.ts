import { bundledPolicy } from "@galaxy-foundry/license-policy";

import { tagRegistry } from "./meta-tags";
import type { BuildKindContextOptions } from "../types/context";

export const licensePolicy = bundledPolicy();

export const REGISTRIES: BuildKindContextOptions = {
  tags: tagRegistry(),
  licensePolicy,
};
