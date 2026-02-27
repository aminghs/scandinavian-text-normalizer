import { describe, it, expect } from "vitest";
import { isEquivalent } from "../src/equivalence";

describe("isEquivalent", () => {
  it("same string is equivalent", () => {
    expect(isEquivalent("hello", "hello")).toBe(true);
  });

  it("Håkon and Haakon are equivalent with default options", () => {
    expect(isEquivalent("Håkon", "Haakon")).toBe(true);
  });

  it("Håkon and Hakon are not equivalent (different normalizations)", () => {
    expect(isEquivalent("Håkon", "Hakon")).toBe(false);
  });

  it("Østberg and Ostberg equivalent with ae_oe_aa", () => {
    expect(isEquivalent("Østberg", "Oestberg", { transliteration: "ae_oe_aa" })).toBe(
      true
    );
  });

  it("Ålesund and Aalesund equivalent", () => {
    expect(isEquivalent("Ålesund", "Aalesund")).toBe(true);
  });

  it("different words are not equivalent", () => {
    expect(isEquivalent("Anna", "Berit")).toBe(false);
  });

  it("diacritics normalized", () => {
    expect(isEquivalent("café", "cafe")).toBe(true);
  });

  it("whitespace normalized", () => {
    expect(isEquivalent("a  b", "a b")).toBe(true);
  });
});
