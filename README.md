# scandinavian-text-normalizer

Zero-dependency TypeScript library for **Scandinavian/Norwegian text normalization** with deterministic, production-safe output. Works in Node and browsers.

## What problem it solves

- **Broken search**: Users type "Hakon", "Haakon", or "Håkon" — you want to match all of them.
- **Duplicates**: "Ålesund" and "Aalesund" should be treated as the same for deduplication or sorting.
- **Slugs and URLs**: Generate safe, readable slugs from Scandinavian text (e.g. `Ålesund` → `aalesund`).
- **Sorting**: Get a stable sort key so that "Åse" sorts after "Anna" and before "Berit" in a predictable way.

This library gives you **deterministic** output (same input → same output every time), **no runtime dependencies**, and **full control** over how æ, ø, å are handled.

## Install

```bash
npm install scandinavian-text-normalizer
```

## Quick start

```ts
import {
  normalize,
  slugify,
  expand,
  sortKey,
  isEquivalent,
} from "scandinavian-text-normalizer";

normalize("Håkon  Østberg");        // "Haakon Oestberg"
slugify("Ålesund – Trondheim");     // "aalesund-trondheim"
expand("Håkon");                    // ["Håkon", "Haakon", "hakon", ...]
sortKey("Åse");                     // "aase" (for sorting)
isEquivalent("Håkon", "Haakon");    // true
```

## API

### `normalize(text, options?)` → `string`

Normalizes text for search/matching: Unicode normalization (NFKD), strips diacritics, handles Scandinavian letters (æ, ø, å) according to `transliteration`, collapses whitespace, normalizes quotes and dashes. Deterministic and ASCII-friendly when using `ae_oe_aa` or `a_o_a`.

```ts
normalize("café");           // "cafe"
normalize("Håkon");         // "Haakon" (default transliteration: ae_oe_aa)
normalize("  a  \t  b  ");  // "a b"
```

### `slugify(text, options?)` → `string`

Lowercases, normalizes, then replaces spaces and punctuation with `-`, collapses repeated dashes, trims. Respects `maxLength` (default 80) and tries not to cut in the middle of a word.

```ts
slugify("Hello, World!");   // "hello-world"
slugify("Ålesund");         // "aalesund"
```

### `expand(text, options?)` → `string[]`

Returns unique variants for **search query expansion**: original, normalized, and æ/ø/å ↔ ae/oe/aa (or a/o/a) variants. Capped at 10 by default (`maxVariants`). Stable order. Use when building search synonyms or “also search for” suggestions.

```ts
expand("Håkon");   // ["Håkon", "Haakon", "hakon", "Hakon", ...]
```

### `sortKey(text, options?)` → `string`

Produces a stable ASCII-only key for sorting. Uses `normalize` with `mode: "search"` and `transliteration: "ae_oe_aa"` by default so that e.g. Å sorts after A and before B.

```ts
["Åse", "Anna", "Berit"].sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
// ["Anna", "Åse", "Berit"]
```

### `isEquivalent(a, b, options?)` → `boolean`

Returns `true` if both strings are equal after normalization (same options).

```ts
isEquivalent("Håkon", "Haakon");   // true
isEquivalent("Ålesund", "Aalesund"); // true
```

## Options

All options are optional. Shared across functions where applicable.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `locale` | `"no" \| "sv" \| "da" \| "is" \| "default"` | `"default"` | Locale hint (for future extensions). |
| `mode` | `"search" \| "strict"` | `"search"` | `search` = looser normalization; `strict` = preserve more (e.g. Scandinavian letters when combined with `preserveScandinavianLetters`). |
| `transliteration` | `"keep" \| "ae_oe_aa" \| "a_o_a"` | `"ae_oe_aa"` | How to map æ, ø, å: `ae_oe_aa` → ae, oe, aa; `a_o_a` → a, o, a; `keep` = keep letters (still case-fold etc.). |
| `preserveScandinavianLetters` | `boolean` | `mode === "strict"` for normalize/slugify/expand; `false` for sortKey | When true, keep æ, ø, å. |
| `removeEmoji` | `boolean` | `true` | Remove emoji and similar symbols. |
| `keepDigits` | `boolean` | `true` | Keep digits 0–9. |
| `maxLength` | `number` | `80` | **slugify only.** Max slug length; truncation tries to break at word boundaries. |
| `maxVariants` | `number` | `10` | **expand only.** Max number of variants returned. |

## Design decisions

- **Deterministic output**: Same input and options always produce the same output. No randomness, no locale-dependent behavior beyond what you opt into.
- **Unicode NFKD**: We use **NFKD** (Canonical Decomposition) so that characters like é become base + combining mark; we then strip combining marks to get plain ASCII. We chose NFKD (rather than NFKC) so that “remove diacritics” is consistent and predictable; NFKC would merge some ligatures (e.g. ﬃ→ffi), which we don’t need for this use case.
- **Zero runtime dependencies**: No external Unicode or locale data at runtime; small and safe for production.
- **Pure functions**: No global mutable state; all options are passed in.
- **Sort key prefixing**: So that Å sorts after A and Ø after O in code-unit order, `sortKey()` uses internal prefixing (e.g. leading `aa`→`ao`, `oe`→`op`) when the string starts with Å/Ø. The result remains ASCII-only and deterministic.

## Playground

From the repo root after clone:

```bash
npm install
npm run build
npm run playground
```

Or run the script directly with tsx (uses source):

```bash
npx tsx scripts/playground.ts
```

## Development

```bash
npm install
npm run lint      # ESLint
npm run format:check
npm test          # Vitest
npm run build     # tsup → ESM + CJS + types
npm run benchmark # Optional: 10k iterations
```

## License

MIT.
