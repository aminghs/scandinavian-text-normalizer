import { describe, it, expect } from "vitest";
import {
  getNormalizeOptions,
  getSluggifyOptions,
  getExpandOptions,
} from "../src/options";

describe("options", () => {
  it("getNormalizeOptions returns defaults", () => {
    const o = getNormalizeOptions();
    expect(o.locale).toBe("default");
    expect(o.mode).toBe("search");
    expect(o.transliteration).toBe("ae_oe_aa");
    expect(o.removeEmoji).toBe(true);
    expect(o.keepDigits).toBe(true);
  });

  it("preserveScandinavianLetters defaults to false for search mode", () => {
    const o = getNormalizeOptions({ mode: "search" });
    expect(o.preserveScandinavianLetters).toBe(false);
  });

  it("preserveScandinavianLetters defaults to true for strict mode", () => {
    const o = getNormalizeOptions({ mode: "strict" });
    expect(o.preserveScandinavianLetters).toBe(true);
  });

  it("getSluggifyOptions includes maxLength", () => {
    const o = getSluggifyOptions();
    expect(o.maxLength).toBe(80);
    const o2 = getSluggifyOptions({ maxLength: 50 });
    expect(o2.maxLength).toBe(50);
  });

  it("getExpandOptions includes maxVariants", () => {
    const o = getExpandOptions();
    expect(o.maxVariants).toBe(10);
  });
});
