#!/usr/bin/env node
/**
 * Playground script: run with `npm run playground` to try the library locally.
 *
 * Usage: npx tsx scripts/playground.ts
 */

// When run from repo: use source. After build, you can use "scandinavian-text-normalizer"
import {
  normalize,
  slugify,
  expand,
  sortKey,
  isEquivalent,
} from "../src/index.js";

const examples = [
  "Håkon",
  "Haakon",
  "Østberg",
  "Ålesund",
  "café",
  "Hello  \t  World",
  "Trondheim – Bergen",
];

console.log("=== scandinavian-text-normalizer playground ===\n");

console.log("normalize(text):");
for (const text of examples) {
  console.log(`  "${text}" → "${normalize(text)}"`);
}

console.log("\nslugify(text):");
for (const text of examples.slice(0, 5)) {
  console.log(`  "${text}" → "${slugify(text)}"`);
}

console.log("\nexpand('Håkon') (search variants):");
console.log("  ", expand("Håkon"));

console.log("\nsortKey (for sorting):");
const names = ["Åse", "Anna", "Berit", "Østberg", "Olsen"];
const sorted = [...names].sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
console.log("  ", names, "→ sorted:", sorted);

console.log("\nisEquivalent:");
console.log("  isEquivalent('Håkon', 'Haakon') →", isEquivalent("Håkon", "Haakon"));
console.log("  isEquivalent('Ålesund', 'Aalesund') →", isEquivalent("Ålesund", "Aalesund"));

console.log("\nDone.");
