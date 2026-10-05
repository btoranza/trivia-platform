import { describe, expect, it } from "vitest";
import { parseShareParams, shareImagePath } from "@/lib/share-image";

const parse = (query: string) => parseShareParams(new URLSearchParams(query));

describe("parseShareParams", () => {
  it("reads a valid score", () => {
    expect(parse("score=42&total=48")).toEqual({ score: 42, total: 48 });
  });

  it("accepts a score of zero and a perfect score", () => {
    expect(parse("score=0&total=10")).toEqual({ score: 0, total: 10 });
    expect(parse("score=10&total=10")).toEqual({ score: 10, total: 10 });
  });

  it("rejects missing values", () => {
    expect(parse("score=3")).toBeNull();
    expect(parse("total=3")).toBeNull();
    expect(parse("")).toBeNull();
  });

  it("rejects values that are not whole numbers", () => {
    expect(parse("score=-1&total=10")).toBeNull();
    expect(parse("score=1.5&total=10")).toBeNull();
    expect(parse("score=abc&total=10")).toBeNull();
    expect(parse("score=%20&total=10")).toBeNull();
  });

  it("rejects a score above the total, or a total out of range", () => {
    expect(parse("score=11&total=10")).toBeNull();
    expect(parse("score=0&total=0")).toBeNull();
    expect(parse("score=1&total=9999")).toBeNull();
  });
});

describe("shareImagePath", () => {
  it("builds the endpoint address", () => {
    expect(shareImagePath(42, 48)).toBe("/api/share-image?score=42&total=48");
  });
});
