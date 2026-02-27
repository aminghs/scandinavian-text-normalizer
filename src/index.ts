/**
 * scandinavian-text-normalizer
 *
 * Zero-dependency TypeScript library for Scandinavian/Norwegian text normalization
 * with deterministic, production-safe output. Works in Node and browsers.
 */

export { normalize } from "./normalize.js";
export { slugify } from "./slugify.js";
export { expand } from "./expand.js";
export { sortKey } from "./sortKey.js";
export { isEquivalent } from "./equivalence.js";

export type {
  BaseOptions,
  NormalizeOptions,
  SluggifyOptions,
  ExpandOptions,
  SortKeyOptions,
  LocaleOption,
  TransliterationOption,
} from "./options.js";
