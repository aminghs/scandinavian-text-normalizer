import { describe, it, expect } from "vitest";
import { expand } from "../src/expand";

describe("expand", () => {
  it("includes original and normalized form", () => {
    const r = expand("Håkon");
    expect(r).toContain("Håkon");
    expect(r).toContain("Haakon");
  });

  it("returns unique variants in stable order", () => {
    const r = expand("Ålesund");
    expect(r.length).toBeGreaterThanOrEqual(2);
    expect(r.length).toBeLessThanOrEqual(10);
    const set = new Set(r);
    expect(set.size).toBe(r.length);
  });

  it("respects maxVariants", () => {
    const r = expand("Østberg", { maxVariants: 3 });
    expect(r.length).toBeLessThanOrEqual(3);
  });

  it("returns empty array for non-string", () => {
    expect(expand(null as unknown as string)).toEqual([]);
  });

  it("expand Håkon includes Haakon and Hakon-like variants", () => {
    const r = expand("Håkon", { transliteration: "ae_oe_aa" });
    expect(r.some((x) => x.toLowerCase().includes("haakon") || x.toLowerCase().includes("hakon"))).toBe(true);
  });

  it("expand is deterministic", () => {
    expect(expand("Ærø")).toEqual(expand("Ærø"));
  });
});
