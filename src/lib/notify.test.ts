import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { notifyAdmin } from "@/lib/notify";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => {});
  fetchMock.mockResolvedValue({ ok: true, status: 204 });
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});

describe("notifyAdmin", () => {
  it("does nothing without a webhook URL", async () => {
    vi.stubEnv("DISCORD_WEBHOOK_URL", "");

    await notifyAdmin("hello");

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts the message with a link to the admin page", async () => {
    vi.stubEnv("DISCORD_WEBHOOK_URL", "https://discord.test/hook");
    vi.stubEnv("SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "my-site.vercel.app");

    await notifyAdmin("New note:");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://discord.test/hook");
    expect(init.method).toBe("POST");
    expect(init.headers["User-Agent"]).toContain("FrontendTrivia");
    expect(JSON.parse(init.body)).toEqual({
      content: "New note: https://my-site.vercel.app/admin",
      allowed_mentions: { parse: [] },
    });
  });

  it("prefers SITE_URL and keeps its protocol", async () => {
    vi.stubEnv("DISCORD_WEBHOOK_URL", "https://discord.test/hook");
    vi.stubEnv("SITE_URL", "http://localhost:3000");

    await notifyAdmin("Hi");

    expect(JSON.parse(fetchMock.mock.calls[0][1].body).content).toBe(
      "Hi http://localhost:3000/admin",
    );
  });

  it("sends just the message when the site URL is unknown", async () => {
    vi.stubEnv("DISCORD_WEBHOOK_URL", "https://discord.test/hook");
    vi.stubEnv("SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");

    await notifyAdmin("Hi");

    expect(JSON.parse(fetchMock.mock.calls[0][1].body).content).toBe("Hi");
  });

  it("never throws when the request fails", async () => {
    vi.stubEnv("DISCORD_WEBHOOK_URL", "https://discord.test/hook");
    fetchMock.mockRejectedValue(new Error("network down"));

    await expect(notifyAdmin("Hi")).resolves.toBeUndefined();
  });

  it("never throws when Discord answers with an error", async () => {
    vi.stubEnv("DISCORD_WEBHOOK_URL", "https://discord.test/hook");
    fetchMock.mockResolvedValue({ ok: false, status: 404 });

    await expect(notifyAdmin("Hi")).resolves.toBeUndefined();
  });
});
