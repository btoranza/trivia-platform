import { ImageResponse } from "next/og";
import { triviaConfig as config } from "@/config/trivia";
import { loadImageFonts } from "@/lib/image-fonts";
import { IMAGE_COLORS, loadAppIcon } from "@/lib/image-theme";

export const alt = config.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const { ink: INK, accent: ACCENT, canvas: CANVAS, surface: SURFACE } =
  IMAGE_COLORS;

/** The card shown when the site's link is pasted in a chat or a post. */
export default async function Image() {
  const icon = await loadAppIcon();
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: CANVAS,
        color: INK,
        padding: "0 90px",
        fontFamily: "Space Grotesk",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            display: "flex",
            background: ACCENT,
            color: INK,
            border: `6px solid ${INK}`,
            borderRadius: 999,
            boxShadow: `8px 8px 0 ${INK}`,
            padding: "12px 36px",
            fontSize: 32,
            letterSpacing: 2,
            textTransform: "uppercase",
            transform: "rotate(-3deg)",
          }}
        >
          {config.labels.sticker}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 44,
            fontFamily: "Archivo Black",
            fontSize: 96,
            lineHeight: 0.98,
            textTransform: "uppercase",
          }}
        >
          {config.title.split(" ").map((word) => (
            <div key={word} style={{ display: "flex" }}>
              {word}
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 380,
          height: 380,
          background: SURFACE,
          border: `10px solid ${INK}`,
          borderRadius: 999,
          boxShadow: `18px 18px 0 ${INK}`,
        }}
      >
        <img src={icon} width={260} height={260} alt="" />
      </div>
    </div>,
    {
      ...size,
      fonts: await loadImageFonts(),
    },
  );
}
