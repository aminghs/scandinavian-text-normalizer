/**
 * Shared option types for Scandinavian text normalization.
 */

export type LocaleOption = "no" | "sv" | "da" | "is" | "default";

export type TransliterationOption = "keep" | "ae_oe_aa" | "a_o_a";

export interface BaseOptions {
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

export interface NormalizeOptions extends BaseOptions {}

export interface SluggifyOptions extends BaseOptions {
  /** Maximum length of slug (default: 80). Truncation tries to avoid cutting words. */
  maxLength?: number;
}

export interface ExpandOptions extends BaseOptions {
  /** Maximum number of variants to return (default: 10). */
  maxVariants?: number;
}

export interface SortKeyOptions extends BaseOptions {}

const DEFAULT_NORMALIZE_OPTIONS: Required<
  Omit<NormalizeOptions, "locale" | "preserveScandinavianLetters">
> & {
  locale: LocaleOption;
  preserveScandinavianLetters: boolean | undefined;
} = {
  locale: "default",
  mode: "search",
  transliteration: "ae_oe_aa",
  preserveScandinavianLetters: undefined,
  removeEmoji: true,
  keepDigits: true,
};

export function getNormalizeOptions(
  options?: NormalizeOptions
): Required<NormalizeOptions> {
  const opts = { ...DEFAULT_NORMALIZE_OPTIONS, ...options };
  const preserve = opts.preserveScandinavianLetters ?? opts.mode === "strict";
  return {
    ...opts,
    preserveScandinavianLetters: preserve,
  } as Required<NormalizeOptions>;
}

const DEFAULT_SLUGGIFY_OPTIONS: Required<
  Omit<SluggifyOptions, "locale" | "preserveScandinavianLetters">
> & {
  locale: LocaleOption;
  preserveScandinavianLetters: boolean | undefined;
  maxLength: number;
} = {
  ...DEFAULT_NORMALIZE_OPTIONS,
  maxLength: 80,
};

export function getSluggifyOptions(options?: SluggifyOptions): Required<SluggifyOptions> {
  const opts = { ...DEFAULT_SLUGGIFY_OPTIONS, ...options };
  const preserve = opts.preserveScandinavianLetters ?? opts.mode === "strict";
  return {
    ...opts,
    preserveScandinavianLetters: preserve,
  } as Required<SluggifyOptions>;
}

const DEFAULT_EXPAND_OPTIONS: Required<
  Omit<ExpandOptions, "locale" | "preserveScandinavianLetters">
> & {
  locale: LocaleOption;
  preserveScandinavianLetters: boolean | undefined;
  maxVariants: number;
} = {
  ...DEFAULT_NORMALIZE_OPTIONS,
  maxVariants: 10,
};

export function getExpandOptions(options?: ExpandOptions): Required<ExpandOptions> {
  const opts = { ...DEFAULT_EXPAND_OPTIONS, ...options };
  const preserve = opts.preserveScandinavianLetters ?? opts.mode === "strict";
  return {
    ...opts,
    preserveScandinavianLetters: preserve,
  } as Required<ExpandOptions>;
}

const DEFAULT_SORT_KEY_OPTIONS: SortKeyOptions = {
  ...DEFAULT_NORMALIZE_OPTIONS,
  mode: "search",
  transliteration: "ae_oe_aa",
};

export function getSortKeyOptions(options?: SortKeyOptions): Required<SortKeyOptions> {
  const opts = { ...DEFAULT_SORT_KEY_OPTIONS, ...options };
  const preserve = opts.preserveScandinavianLetters ?? false;
  return {
    ...opts,
    preserveScandinavianLetters: preserve,
  } as Required<SortKeyOptions>;
}
