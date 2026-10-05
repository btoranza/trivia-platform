import { readFile } from "node:fs/promises";
import { join } from "node:path";

const fontsDir = join(process.cwd(), "src/assets/fonts");

/** Fonts for the generated images (next/og needs the raw TTF files). */
export async function loadImageFonts() {
  const [archivo, grotesk] = await Promise.all([
    readFile(join(fontsDir, "ArchivoBlack-400.ttf")),
    readFile(join(fontsDir, "SpaceGrotesk-700.ttf")),
  ]);
  return [
    {
      name: "Archivo Black",
      data: archivo,
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Space Grotesk",
      data: grotesk,
      weight: 700 as const,
      style: "normal" as const,
    },
  ];
}
