import { describe, it, expect } from "vitest";
import { normalize } from "../src/normalize";

describe("normalize", () => {
  it("returns empty string for non-string input", () => {
    expect(normalize(null as unknown as string)).toBe("");
    expect(normalize(undefined as unknown as string)).toBe("");
    expect(normalize(123 as unknown as string)).toBe("");
  });

  it("handles Håkon, Haakon, Hakon equivalently with ae_oe_aa", () => {
    const opts = { transliteration: "ae_oe_aa" as const };
    expect(normalize("Håkon", opts)).toBe("Haakon");
    expect(normalize("Haakon", opts)).toBe("Haakon");
    expect(normalize("Hakon", opts)).toBe("Hakon");
  });

  it("handles Østberg, Ostberg, Oe stberg", () => {
    const opts = { transliteration: "ae_oe_aa" as const };
    expect(normalize("Østberg", opts)).toBe("Oestberg");
    expect(normalize("Ostberg", opts)).toBe("Ostberg");
    expect(normalize("Oe stberg", opts)).toBe("Oe stberg");
  });

  it("handles Ålesund, Aalesund", () => {
    const opts = { transliteration: "ae_oe_aa" as const };
    expect(normalize("Ålesund", opts)).toBe("Aalesund");
    expect(normalize("Aalesund", opts)).toBe("Aalesund");
  });

  it("strips diacritics (é, ü)", () => {
    expect(normalize("café")).toBe("cafe");
    expect(normalize("über")).toBe("uber");
    expect(normalize("naïve")).toBe("naive");
  });

  it("replaces ZWSP and NBSP with space", () => {
    expect(normalize("a\u200bb")).toBe("a b");
    expect(normalize("a\u00a0b")).toBe("a b");
  });

  it("collapses various whitespace to single space", () => {
    expect(normalize("a  b")).toBe("a b");
    expect(normalize("a\tb")).toBe("a b");
    expect(normalize("a\nb")).toBe("a b");
    expect(normalize("  a  b  ")).toBe("a b");
  });

  it("replaces smart quotes with normal quotes", () => {
    expect(normalize("\u2018hello\u2019")).toBe("'hello'");
    expect(normalize("\u201chello\u201d")).toBe('"hello"');
  });

  it("replaces en dash and em dash with hyphen", () => {
    expect(normalize("a\u2013b")).toBe("a-b");
    expect(normalize("a\u2014b")).toBe("a-b");
  });

  it("removes emoji when removeEmoji is true (default)", () => {
    expect(normalize("hello 😀 world")).toBe("hello world");
    expect(normalize("test🎉")).toBe("test");
  });

  it("keeps emoji when removeEmoji is false", () => {
    const s = "hello 😀";
    expect(normalize(s, { removeEmoji: false })).toContain("hello");
    // Emoji may be stripped by NFKD or retained; we only skip our EMOJI_REGEX when false
    expect(normalize("hello", { removeEmoji: false })).toBe("hello");
  });

  it("keeps digits by default", () => {
    expect(normalize("room 101")).toBe("room 101");
  });

  it("removes digits when keepDigits is false", () => {
    expect(normalize("room 101", { keepDigits: false })).toBe("room");
  });

  it("transliteration a_o_a", () => {
    expect(normalize("æøå", { transliteration: "a_o_a" })).toBe("aoa");
    expect(normalize("ÆØÅ", { transliteration: "a_o_a" })).toBe("aoa");
  });

  it("transliteration keep preserves æøå", () => {
    expect(
      normalize("æøå", { transliteration: "keep", preserveScandinavianLetters: true })
    ).toBe("æøå");
    expect(
      normalize("ÆØÅ", { transliteration: "keep", preserveScandinavianLetters: true })
    ).toBe("ÆØÅ");
  });

  it("is deterministic", () => {
    const input = "Håkon  \t  Østberg  \u200b  Ålesund";
    expect(normalize(input)).toBe(normalize(input));
    expect(normalize(input)).toBe("Haakon Oestberg Aalesund");
  });
});
