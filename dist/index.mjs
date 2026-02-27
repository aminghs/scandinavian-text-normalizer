// src/options.ts
var DEFAULT_NORMALIZE_OPTIONS = {
  locale: "default",
  mode: "search",
  transliteration: "ae_oe_aa",
  preserveScandinavianLetters: void 0,
  removeEmoji: true,
  keepDigits: true
};
function getNormalizeOptions(options) {
  const opts = { ...DEFAULT_NORMALIZE_OPTIONS, ...options };
  const preserve = opts.preserveScandinavianLetters ?? opts.mode === "strict";
  return {
    ...opts,
    preserveScandinavianLetters: preserve
  };
}
var DEFAULT_SLUGGIFY_OPTIONS = {
  ...DEFAULT_NORMALIZE_OPTIONS,
  maxLength: 80
};
function getSluggifyOptions(options) {
  const opts = { ...DEFAULT_SLUGGIFY_OPTIONS, ...options };
  const preserve = opts.preserveScandinavianLetters ?? opts.mode === "strict";
  return {
    ...opts,
    preserveScandinavianLetters: preserve
  };
}
var DEFAULT_EXPAND_OPTIONS = {
  ...DEFAULT_NORMALIZE_OPTIONS,
  maxVariants: 10
};
function getExpandOptions(options) {
  const opts = { ...DEFAULT_EXPAND_OPTIONS, ...options };
  const preserve = opts.preserveScandinavianLetters ?? opts.mode === "strict";
  return {
    ...opts,
    preserveScandinavianLetters: preserve
  };
}
var DEFAULT_SORT_KEY_OPTIONS = {
  ...DEFAULT_NORMALIZE_OPTIONS,
  mode: "search",
  transliteration: "ae_oe_aa"
};
function getSortKeyOptions(options) {
  const opts = { ...DEFAULT_SORT_KEY_OPTIONS, ...options };
  const preserve = opts.preserveScandinavianLetters ?? false;
  return {
    ...opts,
    preserveScandinavianLetters: preserve
  };
}

// src/normalize.ts
var COMBINING_MARKS_REGEX = /[\u0300-\u036f\u1ab0-\u1aff\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f]/g;
var EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}]/gu;
var SMART_QUOTES = [
  [/\u2018/g, "'"],
  // '
  [/\u2019/g, "'"],
  // '
  [/\u201c/g, '"'],
  // "
  [/\u201d/g, '"'],
  // "
  [/\u00ab/g, '"'],
  // «
  [/\u00bb/g, '"']
  // »
];
var DASH_VARIANTS = /[\u2010-\u2015\u207b\u208b\u2212\ufe58\ufe63\uff0d]/g;
var ZWSP = "\u200B";
var NBSP = "\xA0";
var OTHER_SPACES = /[\t\v\f\r\n\u0085\u2028\u2029]+/g;
function transliterateScandinavian(text, transliteration, preserve) {
  let out = text;
  switch (transliteration) {
    case "ae_oe_aa":
      out = out.replace(/\u00C6/g, "Ae").replace(/\u00e6/g, "ae").replace(/\u00D8/g, "Oe").replace(/\u00f8/g, "oe").replace(/\u00C5/g, "Aa").replace(/\u00e5/g, "aa");
      break;
    case "a_o_a":
      out = out.replace(/\u00e6/gi, "a").replace(/\u00f8/gi, "o").replace(/\u00e5/gi, "a");
      break;
  }
  return out;
}
var PUA_AE = "\uE000";
var PUA_OE = "\uE001";
var PUA_AA = "\uE002";
var PUA_AE_UP = "\uE003";
var PUA_OE_UP = "\uE004";
var PUA_AA_UP = "\uE005";
function preserveScandinavianPlaceholders(text) {
  return text.replace(/\u00C6/g, PUA_AE_UP).replace(/\u00e6/g, PUA_AE).replace(/\u00D8/g, PUA_OE_UP).replace(/\u00f8/g, PUA_OE).replace(/\u00C5/g, PUA_AA_UP).replace(/\u00e5/g, PUA_AA);
}
function restoreScandinavianPlaceholders(text) {
  return text.replace(PUA_AE_UP, "\xC6").replace(PUA_AE, "\xE6").replace(PUA_OE_UP, "\xD8").replace(PUA_OE, "\xF8").replace(PUA_AA_UP, "\xC5").replace(PUA_AA, "\xE5");
}
function removeDigits(text) {
  return text.replace(/\d/g, "");
}
function normalize(text, options) {
  if (typeof text !== "string") return "";
  const opts = getNormalizeOptions(options);
  let s = text;
  s = s.normalize("NFC");
  if (opts.removeEmoji) {
    s = s.replace(EMOJI_REGEX, "");
  }
  if (opts.preserveScandinavianLetters) {
    s = preserveScandinavianPlaceholders(s);
  } else {
    s = transliterateScandinavian(
      s,
      opts.transliteration);
  }
  s = s.normalize("NFKD");
  s = s.replace(COMBINING_MARKS_REGEX, "");
  if (opts.preserveScandinavianLetters) {
    s = restoreScandinavianPlaceholders(s);
  }
  s = s.replace(OTHER_SPACES, " ");
  s = s.split(ZWSP).join(" ");
  s = s.split(NBSP).join(" ");
  for (const [re, replacement] of SMART_QUOTES) {
    s = s.replace(re, replacement);
  }
  s = s.replace(DASH_VARIANTS, "-");
  if (!opts.keepDigits) {
    s = removeDigits(s);
  }
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

// src/slugify.ts
var NON_ALNUM = /[^a-z0-9]+/g;
var DASHES = /-+/g;
function slugify(text, options) {
  if (typeof text !== "string") return "";
  const opts = getSluggifyOptions(options);
  let s = normalize(text, opts);
  s = s.toLowerCase();
  let slug = s.replace(NON_ALNUM, "-");
  slug = slug.replace(DASHES, "-");
  slug = slug.replace(/^-|-$/g, "");
  const maxLen = opts.maxLength;
  if (maxLen > 0 && slug.length > maxLen) {
    const truncated = slug.slice(0, maxLen);
    const lastDash = truncated.lastIndexOf("-");
    if (lastDash > maxLen >> 1) {
      slug = truncated.slice(0, lastDash).replace(/-$/, "");
    } else {
      slug = truncated.replace(/-$/, "");
    }
  }
  return slug;
}

// src/expand.ts
function addUnique(seen, list, value) {
  const key = value.toLowerCase();
  if (value && !seen.has(key)) {
    seen.add(key);
    list.push(value);
  }
}
function expand(text, options) {
  if (typeof text !== "string") return [];
  const opts = getExpandOptions(options);
  const seen = /* @__PURE__ */ new Set();
  const result = [];
  const add = (v) => addUnique(seen, result, v);
  add(text);
  const normalized = normalize(text, opts);
  add(normalized);
  const trans = opts.transliteration;
  if (trans === "keep" || opts.preserveScandinavianLetters) {
    return result.slice(0, opts.maxVariants);
  }
  const lower = text.toLowerCase();
  const variants = [];
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
  const toNormalize = result.slice(2);
  for (const s of toNormalize) {
    if (result.length >= opts.maxVariants) break;
    const n = normalize(s, opts);
    add(n);
  }
  return result.slice(0, opts.maxVariants);
}

// src/sortKey.ts
function sortKey(text, options) {
  if (typeof text !== "string") return "";
  const opts = getSortKeyOptions(options);
  const first = text.normalize("NFC").charAt(0);
  let key = normalize(text, {
    ...opts,
    mode: opts.mode ?? "search",
    transliteration: opts.transliteration ?? "ae_oe_aa",
    preserveScandinavianLetters: false
  });
  key = key.toLowerCase();
  if (first === "\xC5" || first === "\xE5") {
    key = key.replace(/^aa/, "ao");
  }
  if (first === "\xD8" || first === "\xF8") {
    key = key.replace(/^oe/, "op");
  }
  return key;
}

// src/equivalence.ts
function isEquivalent(a, b, options) {
  if (a === b) return true;
  return normalize(a, options) === normalize(b, options);
}

export { expand, isEquivalent, normalize, slugify, sortKey };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map