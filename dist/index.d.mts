/**
 * Shared option types for Scandinavian text normalization.
 */
type LocaleOption = "no" | "sv" | "da" | "is" | "default";
type TransliterationOption = "keep" | "ae_oe_aa" | "a_o_a";
interface BaseOptions {
    /** Locale hint (currently affects future extensions; "default" is locale-agnostic). */
    locale?: LocaleOption;
    /** "search" = looser normalization for matching; "strict" = preserve more distinctions. */
    mode?: "search" | "strict";
    /**
     * How to handle æ, ø, å:
     * - "ae_oe_aa": æ→ae, ø→oe, å→aa (common for search/sorting)
     * - "a_o_a": æ→a, ø→o, å→a (compact)
     * - "keep": keep æ, ø, å (still case-fold, etc.)
     */
    transliteration?: TransliterationOption;
    /** Keep Scandinavian letters (æ, ø, å) when true; default depends on mode. */
    preserveScandinavianLetters?: boolean;
    /** Remove emoji and other symbols (default: true). */
    removeEmoji?: boolean;
    /** Keep digits 0-9 (default: true). */
    keepDigits?: boolean;
}
interface NormalizeOptions extends BaseOptions {
}
interface SluggifyOptions extends BaseOptions {
    /** Maximum length of slug (default: 80). Truncation tries to avoid cutting words. */
    maxLength?: number;
}
interface ExpandOptions extends BaseOptions {
    /** Maximum number of variants to return (default: 10). */
    maxVariants?: number;
}
interface SortKeyOptions extends BaseOptions {
}

/**
 * Core normalization: Unicode NFKD, strip combining marks, handle Scandinavian letters,
 * whitespace, quotes, dashes. Deterministic and production-safe.
 *
 * We use NFKD (Canonical Decomposition) rather than NFKC so that we get base + combining
 * marks (e.g. e + combining acute) which we then strip to get plain ASCII. NFKC would
 * merge some ligatures (e.g. ﬃ→ffi) which is useful for search too, but for consistent
 * "remove diacritics" behavior NFKD + strip is the standard approach.
 */

/**
 * Normalize text for search/matching: deterministic, ASCII-friendly output.
 */
declare function normalize(text: string, options?: NormalizeOptions): string;

/**
 * Slugify: lowercase, normalize, replace spaces/punctuation with "-",
 * collapse repeated "-", trim, enforce maxLength (prefer word boundary).
 */

/**
 * Produce a URL/slug-friendly string. Deterministic and safe for filenames/URLs.
 */
declare function slugify(text: string, options?: SluggifyOptions): string;

/**
 * Search expansion: return unique variants (original, normalized, and
 * æ/ø/å ↔ ae/oe/aa or a/o/a) for query expansion. Stable order, capped count.
 */

/**
 * Generate expansion variants for search (e.g. "Håkon" → "Håkon", "Haakon", "Hakon").
 * Intended for building search query expansions or synonym lists.
 */
declare function expand(text: string, options?: ExpandOptions): string[];

/**
 * Sort key: stable ASCII-only key for consistent ordering (e.g. Å after A, before B).
 * Uses normalize with mode "search" and transliteration "ae_oe_aa" by default.
 * Prefixing: so that "aa" (from Å) sorts after "an" and "oe" (from Ø) sorts after "ol",
 * we replace leading "aa"->"ao" and "oe"->"op" when the original started with Å/Ø.
 */

declare function sortKey(text: string, options?: SortKeyOptions): string;

/**
 * Equivalence check: two strings are equivalent after normalization.
 */

/**
 * Return true if both strings are equal after normalization (same options).
 */
declare function isEquivalent(a: string, b: string, options?: NormalizeOptions): boolean;

export { type BaseOptions, type ExpandOptions, type LocaleOption, type NormalizeOptions, type SluggifyOptions, type SortKeyOptions, type TransliterationOption, expand, isEquivalent, normalize, slugify, sortKey };
