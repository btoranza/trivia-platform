import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));

import {
  checkPassword,
  createSessionToken,
  getAdminPassword,
  verifySessionToken,
} from "@/lib/admin-auth";

const NOW = 1_700_000_000_000;
const WEEK = 60 * 60 * 24 * 7;

beforeEach(() => {
  vi.stubEnv("ADMIN_PASSWORD", "s3cret");
});
afterEach(() => {
  vi.unstubAllEnvs();
});

describe("without ADMIN_PASSWORD", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_PASSWORD", "");
  });

  it("keeps the admin area closed", () => {
    expect(getAdminPassword()).toBeNull();
    expect(checkPassword("")).toBe(false);
    expect(checkPassword("anything")).toBe(false);
    expect(createSessionToken(NOW)).toBeNull();
    expect(verifySessionToken("1.abc", NOW)).toBe(false);
  });
});

describe("checkPassword", () => {
  it("accepts only the exact password", () => {
    expect(checkPassword("s3cret")).toBe(true);
    expect(checkPassword("S3cret")).toBe(false);
    expect(checkPassword("s3cret ")).toBe(false);
    expect(checkPassword("")).toBe(false);
  });
});

describe("session tokens", () => {
  it("round-trips a fresh token", () => {
    const token = createSessionToken(NOW)!;
    expect(verifySessionToken(token, NOW)).toBe(true);
  });

  it("expires after a week", () => {
    const token = createSessionToken(NOW)!;
    expect(verifySessionToken(token, NOW + (WEEK - 1) * 1000)).toBe(true);
    expect(verifySessionToken(token, NOW + (WEEK + 1) * 1000)).toBe(false);
  });

  it("is invalidated when the password changes", () => {
    const token = createSessionToken(NOW)!;
    vi.stubEnv("ADMIN_PASSWORD", "other");
    expect(verifySessionToken(token, NOW)).toBe(false);
  });

  it("rejects a tampered expiry or signature", () => {
    const [expires, signature] = createSessionToken(NOW)!.split(".");
    expect(verifySessionToken(`${Number(expires) + 100}.${signature}`, NOW)).toBe(false);
    expect(verifySessionToken(`${expires}.${"0".repeat(signature.length)}`, NOW)).toBe(false);
    expect(verifySessionToken(`${expires}.short`, NOW)).toBe(false);
  });

  it("rejects missing or malformed tokens", () => {
    expect(verifySessionToken(undefined, NOW)).toBe(false);
    expect(verifySessionToken("", NOW)).toBe(false);
    expect(verifySessionToken("garbage", NOW)).toBe(false);
    expect(verifySessionToken("abc.def", NOW)).toBe(false);
    expect(verifySessionToken(".", NOW)).toBe(false);
  });
});
