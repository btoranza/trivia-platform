import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Colors for the generated images. They mirror the tokens in globals.css
 * (next/og cannot read CSS variables); image-theme.test.ts fails if they drift.
 */
export const IMAGE_COLORS = {
  canvas: "#ffd43b",
  ink: "#111111",
  accent: "#ff6fb5",
  surface: "#ffffff",
} as const;

/** The app icon (src/app/icon.svg) as a data URI, for use in <img> tags. */
export async function loadAppIcon(): Promise<string> {
  const svg = await readFile(join(process.cwd(), "src/app/icon.svg"));
  return `data:image/svg+xml;base64,${svg.toString("base64")}`;
}
