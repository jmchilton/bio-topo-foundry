import type { CollectionName } from "./frontmatter-schema";

/** Reader-facing navigation for the shared detail route. */
export interface DetailRoute {
  label: string;
}

export const DETAIL_ROUTES: Record<CollectionName, DetailRoute> = {
  design: { label: "Design records" },
  environments: { label: "Environments" },
  methods: { label: "Methods" },
  molds: { label: "Molds" },
  papers: { label: "Papers" },
  recipes: { label: "Recipes" },
  "replication-experiments": { label: "Replication experiments" },
  packages: { label: "Packages" },
};
