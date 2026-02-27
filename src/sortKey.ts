/**
 * Sort key: stable ASCII-only key for consistent ordering (e.g. Å after A, before B).
 * Uses normalize with mode "search" and transliteration "ae_oe_aa" by default.
 * Prefixing: so that "aa" (from Å) sorts after "an" and "oe" (from Ø) sorts after "ol",
 * we replace leading "aa"->"ao" and "oe"->"op" when the original started with Å/Ø.
 */

import { normalize } from "./normalize.js";
import type { SortKeyOptions } from "./options.js";
import { getSortKeyOptions } from "./options.js";

export function sortKey(text: string, options?: SortKeyOptions): string {
  if (typeof text !== "string") return "";
  const opts = getSortKeyOptions(options);
  const first = text.normalize("NFC").charAt(0);
  let key = normalize(text, {
    ...opts,
    mode: opts.mode ?? "search",
    transliteration: opts.transliteration ?? "ae_oe_aa",
    preserveScandinavianLetters: false,
  });
  key = key.toLowerCase();
  // So that Å sorts after A (e.g. Anna < Åse): "aa" < "an" in code order, so replace leading "aa" with "ao"
  if (first === "\u00C5" || first === "\u00E5") {
    key = key.replace(/^aa/, "ao");
  }
  // So that Ø sorts after O (e.g. Olsen < Østberg): "oe" < "ol", so replace leading "oe" with "op"
  if (first === "\u00D8" || first === "\u00F8") {
    key = key.replace(/^oe/, "op");
  }
  return key;
}
