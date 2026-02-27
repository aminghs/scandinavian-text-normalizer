/**
 * Equivalence check: two strings are equivalent after normalization.
 */

import { normalize } from "./normalize.js";
import type { NormalizeOptions } from "./options.js";

/**
 * Return true if both strings are equal after normalization (same options).
 */
export function isEquivalent(a: string, b: string, options?: NormalizeOptions): boolean {
  if (a === b) return true;
  return normalize(a, options) === normalize(b, options);
}
