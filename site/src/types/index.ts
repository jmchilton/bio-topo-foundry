import { kind as packageKind } from "./package/schema";
import { kind as paperKind } from "./paper/schema";

export const DEFINITIONS = {
  package: packageKind,
  paper: paperKind,
} as const;
export const KINDS = [packageKind, paperKind] as const;

export { buildKindContext, defineKind } from "./context";
export type {
  BuildKindContextOptions,
  KindContext,
  KindDefinition,
  KindShape,
} from "./context";
