/**
 * Slugify: lowercase, normalize, replace spaces/punctuation with "-",
 * collapse repeated "-", trim, enforce maxLength (prefer word boundary).
 */

import { normalize } from "./normalize.js";
import type { SluggifyOptions } from "./options.js";
import { getSluggifyOptions } from "./options.js";

// Non-alphanumeric (after lowercasing) becomes dash
const NON_ALNUM = /[^a-z0-9]+/g;
const DASHES = /-+/g;

/**
 * Produce a URL/slug-friendly string. Deterministic and safe for filenames/URLs.
 */
export function slugify(text: string, options?: SluggifyOptions): string {
  if (typeof text !== "string") return "";
  const opts = getSluggifyOptions(options);

  let s = normalize(text, opts);
  s = s.toLowerCase();

  // Replace spaces and punctuation with single "-"
  let slug = s.replace(NON_ALNUM, "-");
  // Collapse repeated dashes
  slug = slug.replace(DASHES, "-");
  // Trim leading/trailing dash
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
