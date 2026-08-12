import { fileURLToPath } from "node:url";

import { root } from "astro:config/server";

/** Repository root derived from Astro's project root, independent of bundled module depth. */
export const REPO_ROOT = fileURLToPath(new URL("../", root));
