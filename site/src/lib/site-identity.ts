import type { SiteIdentity } from "@galaxy-foundry/site-kit";

export const SITE_IDENTITY: SiteIdentity = {
  name: "TDA Bioinformatics Foundry",
  fullName: "Topological Data Analysis Bioinformatics Foundry",
  description:
    "A knowledge base for hardening topological data analysis methods into reproducible bioinformatics tools and workflows.",
  repoUrl: "https://github.com/jmchilton/bio-topo-foundry",
  navLinks: [
    { path: "/packages/", label: "Packages" },
    { path: "/environments/", label: "Environments" },
    { path: "/molds/", label: "Molds" },
    { path: "/usage/", label: "Usage" },
    { path: "/papers/", label: "Papers" },
    { path: "/tags/", label: "Tags" },
    { path: "/glossary/", label: "Glossary" },
    // Last, and so under "More" on a full bar. A reader arriving at this Foundry is looking for
    // topological data analysis; the records about the Foundry's own machinery are for the
    // handful who are here to work on it.
    { path: "/design/", label: "Design" },
  ],
  navVisible: 5,
  footerLinks: [],
};
