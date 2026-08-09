import {
  bulletSection,
  refRows,
  runtimeProcedureBody,
  skillSummary,
  stripWikiLinks,
  type CastHooks,
  type ProvenanceRefEntry,
} from "@galaxy-foundry/cast";

import { referenceContract } from "./reference-contract";

const kindLabel = (ref: ProvenanceRefEntry): string =>
  referenceContract().kinds[ref.kind]?.label ?? ref.kind;

/** The TDA-specific prose around the deterministic document and reference assembly. */
export const TDA_CAST_HOOKS: CastHooks = {
  renderers: {},
  bundleFiles: [],
  skillLede:
    "Follow the procedure below using the packaged runtime material. Treat its scientific limits as part of the procedure, not optional context.",
  skillSections: ({ moldName, meta, body, noun, refs }) => {
    const describe = {
      kindLabel,
      modePhrase: (ref: ProvenanceRefEntry): string =>
        ref.mode === "verbatim" ? "carried verbatim" : `carried as ${ref.mode}`,
    };
    const runtime = refs.filter((ref) => ref.used_at !== "cast-time");
    return [
      bulletSection("When To Use", [
        `- ${stripWikiLinks(skillSummary(meta, moldName, noun))}`,
      ]),
      bulletSection(
        "Load Upfront",
        refRows(
          runtime.filter((ref) => ref.load === "upfront"),
          describe,
        ),
      ),
      bulletSection(
        "Load On Demand",
        refRows(
          runtime.filter((ref) => ref.load === "on-demand"),
          describe,
        ),
      ),
      {
        title: "Procedure",
        body:
          runtimeProcedureBody(body, moldName, noun) ||
          "No Mold body supplied.",
      },
      bulletSection("Runtime Notes", [
        "- Use only this bundle and user-supplied inputs at runtime; do not read from the Foundry source tree.",
        "- Treat a packaged Environment manifest and lockfile as the runtime authority rather than reconstructing the dependency set from prose.",
      ]),
    ];
  },
  bundleChecks: [],
};
