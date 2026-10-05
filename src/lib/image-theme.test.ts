import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { IMAGE_COLORS } from "@/lib/image-theme";

const css = readFileSync("src/app/globals.css", "utf8");

describe("IMAGE_COLORS", () => {
  it.each(Object.entries(IMAGE_COLORS))(
    "%s matches its --color token in globals.css",
    (name, hex) => {
      const token = css.match(
        new RegExp(`--color-${name}:\\s*(#[0-9a-f]{6})`, "i"),
      );
      expect(token?.[1].toLowerCase()).toBe(hex);
    },
  );
});
