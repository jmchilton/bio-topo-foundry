import { kind as packageKind } from "./package/schema";

export const DEFINITIONS = { package: packageKind } as const;
export const KINDS = [packageKind] as const;

export { buildKindContext, defineKind } from "./context";
export type {
  BuildKindContextOptions,
  KindContext,
  KindDefinition,
  KindShape,
} from "./context";
