import { describe, it, expect } from "vitest";
import { sortKey } from "../src/sortKey";

describe("sortKey", () => {
  it("produces ASCII-only key for Scandinavian text", () => {
    expect(sortKey("Ålesund")).toBe("aolesund"); // ao so Å sorts after A
    expect(sortKey("Østberg")).toBe("opstberg"); // op so Ø sorts after O
    expect(sortKey("Ærø")).toBe("aeroe");
  });

  it("sorts Å after A, before B", () => {
    expect(sortKey("\u00C5se")).toBe("aose");
    expect(sortKey("Anna")).toBe("anna");
    expect(sortKey("Berit")).toBe("berit");
    const names = ["\u00C5se", "Anna", "Berit"]; // Åse = precomposed U+00C5
    const bySortKey = (a: string, b: string) =>
      sortKey(a) < sortKey(b) ? -1 : sortKey(a) > sortKey(b) ? 1 : 0;
    const sorted = [...names].sort(bySortKey);
    expect(sorted[0]).toBe("Anna");
    expect(sorted[1]).toBe("\u00C5se");
    expect(sorted[2]).toBe("Berit");
  });

  it("sorts Ø after O", () => {
    const names = ["\u00D8stberg", "Olsen", "Pettersen"]; // Ø = U+00D8
    const bySortKey = (a: string, b: string) =>
      sortKey(a) < sortKey(b) ? -1 : sortKey(a) > sortKey(b) ? 1 : 0;
    const sorted = [...names].sort(bySortKey);
    expect(sorted[0]).toBe("Olsen");
    expect(sorted[1]).toBe("\u00D8stberg");
    expect(sorted[2]).toBe("Pettersen");
  });

  it("sorts Æ after A", () => {
    const names = ["\u00C6r\u00F8", "Aarhus", "Bergen"]; // Ærø = U+00C6 r U+00F8
    const bySortKey = (a: string, b: string) =>
      sortKey(a) < sortKey(b) ? -1 : sortKey(a) > sortKey(b) ? 1 : 0;
    const sorted = [...names].sort(bySortKey);
    expect(sorted[0]).toBe("Aarhus");
    expect(sorted[1]).toBe("\u00C6r\u00F8");
    expect(sorted[2]).toBe("Bergen");
  });

  it("is deterministic", () => {
    expect(sortKey("Håkon")).toBe(sortKey("Håkon"));
  });

  it("returns empty string for non-string", () => {
    expect(sortKey(null as unknown as string)).toBe("");
  });
});
