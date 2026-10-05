import type { Metadata } from "next";
import { Archivo_Black, Space_Grotesk } from "next/font/google";
import { triviaConfig } from "@/config/trivia";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  weight: "400",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Absolute base for the link-preview image URLs.
  metadataBase: new URL(siteUrl() ?? "http://localhost:3000"),
  title: triviaConfig.title,
  description: triviaConfig.description,
  openGraph: {
    title: triviaConfig.title,
    description: triviaConfig.description,
    siteName: triviaConfig.title,
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivoBlack.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col px-4 py-4 md:max-w-5xl md:px-10 md:py-10">
          {children}
        </div>
      </body>
    </html>
  );
}
