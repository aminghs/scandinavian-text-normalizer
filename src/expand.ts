/**
 * Search expansion: return unique variants (original, normalized, and
 * æ/ø/å ↔ ae/oe/aa or a/o/a) for query expansion. Stable order, capped count.
 */

import { normalize } from "./normalize.js";
import type { ExpandOptions } from "./options.js";
import { getExpandOptions } from "./options.js";

function addUnique(seen: Set<string>, list: string[], value: string): void {
  const key = value.toLowerCase();
  if (value && !seen.has(key)) {
    seen.add(key);
    list.push(value);
  }
}

/**
 * Generate expansion variants for search (e.g. "Håkon" → "Håkon", "Haakon", "Hakon").
 * Intended for building search query expansions or synonym lists.
 */
export function expand(text: string, options?: ExpandOptions): string[] {
  if (typeof text !== "string") return [];
  const opts = getExpandOptions(options);
  const seen = new Set<string>();
  const result: string[] = [];

  const add = (v: string) => addUnique(seen, result, v);

  add(text);
  const normalized = normalize(text, opts);
  add(normalized);

  const trans = opts.transliteration;
  if (trans === "keep" || opts.preserveScandinavianLetters) {
    return result.slice(0, opts.maxVariants);
  }

  // Build variants by swapping Scandinavian ↔ ASCII equivalents
  const lower = text.toLowerCase();
  const variants: string[] = [];

  if (trans === "ae_oe_aa") {
    variants.push(
      lower.replace(/\u00e6/g, "ae").replace(/\u00f8/g, "oe").replace(/\u00e5/g, "aa"),
      lower.replace(/\u00e6/g, "a").replace(/\u00f8/g, "o").replace(/\u00e5/g, "a"),
      text.replace(/\u00e6/gi, "ae").replace(/\u00f8/gi, "oe").replace(/\u00e5/gi, "aa"),
      text.replace(/\u00e6/gi, "a").replace(/\u00f8/gi, "o").replace(/\u00e5/gi, "a")
    );
  } else if (trans === "a_o_a") {
    variants.push(
      lower.replace(/\u00e6/g, "a").replace(/\u00f8/g, "o").replace(/\u00e5/g, "a"),
      text.replace(/\u00e6/gi, "a").replace(/\u00f8/gi, "o").replace(/\u00e5/gi, "a")
    );
  }

  for (const v of variants) {
    add(v);
    if (result.length >= opts.maxVariants) break;
  }

  // Add normalized forms of any new variants if we have room
  const toNormalize = result.slice(2);
  for (const s of toNormalize) {
    if (result.length >= opts.maxVariants) break;
    const n = normalize(s, opts);
    add(n);
  }

  return result.slice(0, opts.maxVariants);
}
