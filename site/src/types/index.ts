import { kind as environmentKind } from "./environment/schema";
import { kind as packageKind } from "./package/schema";
import { kind as paperKind } from "./paper/schema";

export const DEFINITIONS = {
  environment: environmentKind,
  package: packageKind,
  paper: paperKind,
} as const;
export const KINDS = [environmentKind, packageKind, paperKind] as const;

export { buildKindContext, defineKind } from "./context";
export type {
  BuildKindContextOptions,
  KindContext,
  KindDefinition,
  KindShape,
} from "./context";
