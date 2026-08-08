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
    { path: "/papers/", label: "Papers" },
    { path: "/glossary/", label: "Glossary" },
  ],
  navVisible: 4,
  footerLinks: [],
};
