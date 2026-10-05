import { afterEach, describe, expect, it, vi } from "vitest";
import { siteUrl } from "@/lib/site-url";

afterEach(() => vi.unstubAllEnvs());

describe("siteUrl", () => {
  it("prefers SITE_URL and keeps its protocol", () => {
    vi.stubEnv("SITE_URL", "http://localhost:3000");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "my-site.vercel.app");
    expect(siteUrl()).toBe("http://localhost:3000");
  });

  it("adds https to the Vercel domain", () => {
    vi.stubEnv("SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "my-site.vercel.app");
    expect(siteUrl()).toBe("https://my-site.vercel.app");
  });

  it("is undefined when both are unset or empty", () => {
    vi.stubEnv("SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
    expect(siteUrl()).toBeUndefined();
  });
});
