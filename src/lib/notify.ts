import { siteUrl } from "@/lib/site-url";

/**
 * Optional heads-up in a Discord channel, so new submissions and notes don't
 * go unnoticed. Does nothing unless DISCORD_WEBHOOK_URL is set, and never
 * throws: a failed notification must not break the visitor's submission.
 * Only a short message and a link to /admin are sent, never the visitor's text.
 */
export async function notifyAdmin(message: string): Promise<void> {
  const webhook = process.env.DISCORD_WEBHOOK_URL;
  if (!webhook) return;

  const site = siteUrl();
  const link = site ? ` ${site}/admin` : "";

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Some hosts reject requests that do not say who is calling.
        "User-Agent":
          "FrontendTrivia (https://github.com/btoranza/trivia-platform)",
      },
      body: JSON.stringify({
        content: `${message}${link}`,
        allowed_mentions: { parse: [] },
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error("Notification failed with status", res.status);
  } catch (err) {
    console.error("Notification failed", err);
  }
}
