/**
 * Core normalization: Unicode NFKD, strip combining marks, handle Scandinavian letters,
 * whitespace, quotes, dashes. Deterministic and production-safe.
 *
 * We use NFKD (Canonical Decomposition) rather than NFKC so that we get base + combining
 * marks (e.g. e + combining acute) which we then strip to get plain ASCII. NFKC would
 * merge some ligatures (e.g. ﬃ→ffi) which is useful for search too, but for consistent
 * "remove diacritics" behavior NFKD + strip is the standard approach.
 */

import type { NormalizeOptions, TransliterationOption } from "./options.js";
import { getNormalizeOptions } from "./options.js";

// Unicode categories: Mn = Nonspacing_Mark, Mc = Spacing_Mark, Me = Enclosing_Mark
// eslint-disable-next-line no-misleading-character-class -- intentional Unicode ranges
// Match any combining mark (Unicode category M) - avoids "combined character in character class" error
const COMBINING_MARKS_REGEX = /\p{M}/gu;

// Emoji and symbols (common ranges); keep it conservative to avoid removing valid letters
const EMOJI_REGEX =
  /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}]/gu; // eslint-disable-line no-misleading-character-class

const SMART_QUOTES: [RegExp, string][] = [
  [/\u2018/g, "'"], // '
  [/\u2019/g, "'"], // '
  [/\u201c/g, '"'], // "
  [/\u201d/g, '"'], // "
  [/\u00ab/g, '"'], // «
  [/\u00bb/g, '"'], // »
];

const DASH_VARIANTS = /[\u2010-\u2015\u207b\u208b\u2212\ufe58\ufe63\uff0d]/g;

const ZWSP = "\u200b";
const NBSP = "\u00a0";
// Vertical tab \u000b included for completeness
const OTHER_SPACES = /[\t\v\f\r\n\u0085\u2028\u2029]+/g;

// Case-preserving replacements: uppercase Scandinavian -> capitalized digraph, lowercase -> lowercase digraph
function transliterateScandinavian(
  text: string,
  transliteration: TransliterationOption,
  preserve: boolean
): string {
  if (preserve) return text;
  let out = text;
  switch (transliteration) {
    case "ae_oe_aa":
      out = out
        .replace(/\u00C6/g, "Ae")
        .replace(/\u00e6/g, "ae")
        .replace(/\u00D8/g, "Oe")
        .replace(/\u00f8/g, "oe")
        .replace(/\u00C5/g, "Aa")
        .replace(/\u00e5/g, "aa");
      break;
    case "a_o_a":
      out = out
        .replace(/\u00e6/gi, "a")
        .replace(/\u00f8/gi, "o")
        .replace(/\u00e5/gi, "a");
      break;
    case "keep":
      break;
  }
  return out;
}

// Private Use Area placeholders to protect Scandinavian letters from NFKD decomposition
const PUA_AE = "\uE000";
const PUA_OE = "\uE001";
const PUA_AA = "\uE002";
const PUA_AE_UP = "\uE003";
const PUA_OE_UP = "\uE004";
const PUA_AA_UP = "\uE005";

function preserveScandinavianPlaceholders(text: string): string {
  return text
    .replace(/\u00C6/g, PUA_AE_UP)
    .replace(/\u00e6/g, PUA_AE)
    .replace(/\u00D8/g, PUA_OE_UP)
    .replace(/\u00f8/g, PUA_OE)
    .replace(/\u00C5/g, PUA_AA_UP)
    .replace(/\u00e5/g, PUA_AA);
}

function restoreScandinavianPlaceholders(text: string): string {
  return text
    .replace(PUA_AE_UP, "\u00C6")
    .replace(PUA_AE, "\u00e6")
    .replace(PUA_OE_UP, "\u00D8")
    .replace(PUA_OE, "\u00f8")
    .replace(PUA_AA_UP, "\u00C5")
    .replace(PUA_AA, "\u00e5");
}

function removeDigits(text: string): string {
  return text.replace(/\d/g, "");
}

/**
 * Normalize text for search/matching: deterministic, ASCII-friendly output.
 */
export function normalize(text: string, options?: NormalizeOptions): string {
  if (typeof text !== "string") return "";
  const opts = getNormalizeOptions(options);

  let s = text;

  // Compose so decomposed Å (A+U+030A) becomes precomposed U+00C5 for consistent replacement
  s = s.normalize("NFC");

  // Remove emoji first (before normalization) so we don't affect other chars
  if (opts.removeEmoji) {
    s = s.replace(EMOJI_REGEX, "");
  }

  // Scandinavian letters: replace BEFORE NFKD so Å doesn't decompose to A+ring.
  // When preserving, use placeholders so NFKD doesn't decompose them; restore after.
  if (opts.preserveScandinavianLetters) {
    s = preserveScandinavianPlaceholders(s);
  } else {
    s = transliterateScandinavian(s, opts.transliteration, false);
  }

  // Unicode NFKD: canonical decomposition (é → e + combining acute)
  s = s.normalize("NFKD");

  // Strip combining diacritical marks (Mn, Mc, Me)
  s = s.replace(COMBINING_MARKS_REGEX, "");

  if (opts.preserveScandinavianLetters) {
    s = restoreScandinavianPlaceholders(s);
  }

  // Replace various spaces with space; trim later
  s = s.replace(OTHER_SPACES, " ");
  s = s.split(ZWSP).join(" ");
  s = s.split(NBSP).join(" ");

  // Smart quotes and dashes
  for (const [re, replacement] of SMART_QUOTES) {
    s = s.replace(re, replacement);
  }
  s = s.replace(DASH_VARIANTS, "-");

  if (!opts.keepDigits) {
    s = removeDigits(s);
  }

  // Collapse multiple spaces and trim
  s = s.replace(/\s+/g, " ").trim();

  return s;
}
