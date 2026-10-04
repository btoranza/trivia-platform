import { describe, expect, it } from "vitest";
import { parseRichText } from "@/lib/rich-text";

describe("parseRichText", () => {
  it("returns nothing for empty text", () => {
    expect(parseRichText("")).toEqual([]);
  });

  it("returns plain text as a single part", () => {
    expect(parseRichText("just words")).toEqual([{ type: "text", value: "just words" }]);
  });

  it("splits inline code", () => {
    expect(parseRichText("Use `flex` here")).toEqual([
      { type: "text", value: "Use " },
      { type: "code", value: "flex" },
      { type: "text", value: " here" },
    ]);
  });

  it("handles several inline snippets and one at the very start or end", () => {
    expect(parseRichText("`a` and `b`")).toEqual([
      { type: "code", value: "a" },
      { type: "text", value: " and " },
      { type: "code", value: "b" },
    ]);
  });

  it("parses fenced blocks, dropping the language tag", () => {
    expect(parseRichText("Before\n```js\nconst a = 1;\n```\nAfter")).toEqual([
      { type: "text", value: "Before\n" },
      { type: "block", value: "const a = 1;" },
      { type: "text", value: "\nAfter" },
    ]);
  });

  it("does not treat backticks inside a block as inline code", () => {
    const parts = parseRichText("```\nuse `x` inside\n```");
    expect(parts).toEqual([{ type: "block", value: "use `x` inside" }]);
  });

  it("leaves an unclosed fence or lone backtick as text", () => {
    expect(parseRichText("```\nnever closed")).toEqual([
      { type: "text", value: "```\nnever closed" },
    ]);
    expect(parseRichText("a ` b")).toEqual([{ type: "text", value: "a ` b" }]);
  });

  it("does not span inline code across lines", () => {
    expect(parseRichText("`a\nb`")).toEqual([{ type: "text", value: "`a\nb`" }]);
  });
});
