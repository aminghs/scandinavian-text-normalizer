import { describe, it, expect } from "vitest";
import { slugify } from "../src/slugify";

describe("slugify", () => {
  it("lowercases and replaces spaces with dash", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("handles Scandinavian letters with ae_oe_aa", () => {
    expect(slugify("Ålesund")).toBe("aalesund");
    expect(slugify("Håkon Østberg")).toBe("haakon-oestberg");
  });

  it("collapses repeated dashes", () => {
    expect(slugify("a   b")).toBe("a-b");
    expect(slugify("a---b")).toBe("a-b");
  });

  it("removes leading and trailing dashes", () => {
    expect(slugify("  hello  ")).toBe("hello");
    expect(slugify("--hello--")).toBe("hello");
  });

  it("enforces maxLength without cutting mid-word when possible", () => {
    const long = "one two three four five six seven eight nine ten";
    const slug = slugify(long, { maxLength: 20 });
    expect(slug.length).toBeLessThanOrEqual(20);
    expect(slug).toBe("one-two-three-four"); // break at word boundary
  });

  it("enforces maxLength with short words", () => {
    const slug = slugify("a b c d e f g h i j", { maxLength: 10 });
    expect(slug.length).toBeLessThanOrEqual(10);
  });

  it("handles mixed punctuation", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
  });

  it("returns empty for non-string", () => {
    expect(slugify(null as unknown as string)).toBe("");
  });

  it("maxLength 0 or negative does not truncate", () => {
    expect(slugify("hello world", { maxLength: 0 })).toBe("hello-world");
  });
});
