import { ImageResponse } from "next/og";
import { triviaConfig as config } from "@/config/trivia";
import { loadImageFonts } from "@/lib/image-fonts";
import { IMAGE_COLORS, loadAppIcon } from "@/lib/image-theme";
import { getTier } from "@/lib/quiz";
import { SHARE_IMAGE_SIZE, parseShareParams } from "@/lib/share-image";

const { ink: INK, accent: ACCENT, canvas: CANVAS, surface: SURFACE } =
  IMAGE_COLORS;

/** A 1080x1920 results card for stories and chats, drawn from the score. */
export async function GET(request: Request) {
  const { searchParams, host } = new URL(request.url);
  const parsed = parseShareParams(searchParams);
  if (!parsed) return new Response("Invalid score", { status: 400 });

  const { score, total } = parsed;
  const tier = getTier(config.tiers, score, total);
  const words = config.title.split(" ");
  // Longer scores such as 100/100 need a smaller size to stay inside the badge.
  const scoreLength = `${score}/${total}`.length;
  const scoreSize = scoreLength <= 5 ? 160 : scoreLength <= 7 ? 126 : 100;

  const icon = await loadAppIcon();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        background: CANVAS,
        color: INK,
        padding: "96px 80px 80px",
        fontFamily: "Space Grotesk",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            background: ACCENT,
            color: INK,
            border: `7px solid ${INK}`,
            borderRadius: 999,
            boxShadow: `10px 10px 0 ${INK}`,
            padding: "16px 44px",
            fontSize: 38,
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
            alignItems: "center",
            marginTop: 56,
            fontFamily: "Archivo Black",
            fontSize: 118,
            lineHeight: 0.98,
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          {words.map((word) => (
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
          width: 560,
          height: 560,
          background: ACCENT,
          border: `12px solid ${INK}`,
          borderRadius: 999,
          boxShadow: `22px 22px 0 ${INK}`,
          color: INK,
          fontFamily: "Archivo Black",
          fontSize: scoreSize,
          transform: "rotate(-6deg)",
        }}
      >
        {score}/{total}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          background: SURFACE,
          border: `8px solid ${INK}`,
          boxShadow: `16px 16px 0 ${INK}`,
          padding: "40px 48px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 34,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          {config.labels.youAreA}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 8,
            fontFamily: "Archivo Black",
            fontSize: 88,
            lineHeight: 1,
            textTransform: "uppercase",
          }}
        >
          {tier.title}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 40,
            lineHeight: 1.3,
          }}
        >
          {tier.message}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={icon} width={92} height={92} alt="" />
        <div style={{ display: "flex", fontSize: 42 }}>{host}</div>
      </div>
    </div>,
    {
      ...SHARE_IMAGE_SIZE,
      fonts: await loadImageFonts(),
      // The picture depends only on the query string, so it can be cached for good.
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    },
  );
}
