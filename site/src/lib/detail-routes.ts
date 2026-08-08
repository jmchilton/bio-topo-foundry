import type { CollectionName } from "./frontmatter-schema";

/** Reader-facing navigation for the shared detail route. */
export interface DetailRoute {
  label: string;
}

export const DETAIL_ROUTES: Record<CollectionName, DetailRoute> = {
  environments: { label: "Environments" },
  papers: { label: "Papers" },
  packages: { label: "Packages" },
};
