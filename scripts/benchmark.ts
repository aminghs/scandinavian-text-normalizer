#!/usr/bin/env node
/**
 * Simple benchmark: run 10k normalizations/slugifies to compare performance.
 * No external libs. Usage: npm run benchmark
 */

import { normalize, slugify, expand, sortKey } from "../src/index.js";

const SAMPLES = 10_000;
const inputs = [
  "Håkon Østberg",
  "Ålesund – Trondheim",
  "café naïve",
  "Hello  \t  World   ",
  "Ærø",
];

function run(name: string, fn: () => void): number {
  const start = performance.now();
  fn();
  return performance.now() - start;
}

// Warmup
for (let i = 0; i < 1000; i++) {
  normalize(inputs[i % inputs.length]);
  slugify(inputs[i % inputs.length]);
}

const normTime = run("normalize", () => {
  for (let i = 0; i < SAMPLES; i++) {
    normalize(inputs[i % inputs.length]);
  }
});

const slugTime = run("slugify", () => {
  for (let i = 0; i < SAMPLES; i++) {
    slugify(inputs[i % inputs.length]);
  }
});

const expandTime = run("expand", () => {
  for (let i = 0; i < SAMPLES; i++) {
    expand(inputs[i % inputs.length]);
  }
});

const sortKeyTime = run("sortKey", () => {
  for (let i = 0; i < SAMPLES; i++) {
    sortKey(inputs[i % inputs.length]);
  }
});

console.log(`Benchmark (${SAMPLES} iterations):`);
console.log(`  normalize: ${normTime.toFixed(2)} ms`);
console.log(`  slugify:   ${slugTime.toFixed(2)} ms`);
console.log(`  expand:    ${expandTime.toFixed(2)} ms`);
console.log(`  sortKey:   ${sortKeyTime.toFixed(2)} ms`);
