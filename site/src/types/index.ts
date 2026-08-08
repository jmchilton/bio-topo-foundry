import { kind as environmentKind } from "./environment/schema";
import { kind as methodKind } from "./method/schema";
import { kind as moldKind } from "./mold/schema";
import { kind as packageKind } from "./package/schema";
import { kind as paperKind } from "./paper/schema";
import { kind as replicationExperimentKind } from "./replication_experiment/schema";

export const DEFINITIONS = {
  environment: environmentKind,
  method: methodKind,
  mold: moldKind,
  package: packageKind,
  paper: paperKind,
  replication_experiment: replicationExperimentKind,
} as const;
export const KINDS = [
  environmentKind,
  methodKind,
  moldKind,
  packageKind,
  paperKind,
  replicationExperimentKind,
] as const;

export { buildKindContext, defineKind } from "./context";
export type {
  BuildKindContextOptions,
  KindContext,
  KindDefinition,
  KindShape,
} from "./context";
