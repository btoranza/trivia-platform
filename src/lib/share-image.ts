export const SHARE_IMAGE_SIZE = { width: 1080, height: 1920 } as const;
export const MAX_SHARE_TOTAL = 500;

/** Address of the generated results image for a score. */
export function shareImagePath(score: number, total: number): string {
  return `/api/share-image?score=${score}&total=${total}`;
}

/**
 * Reads `score` and `total` from the query string. Returns null unless both
 * are whole numbers with 0 <= score <= total, so the endpoint can't be used
 * to draw arbitrary text.
 */
export function parseShareParams(
  params: URLSearchParams,
): { score: number; total: number } | null {
  const read = (key: string) => {
    const raw = params.get(key);
    return raw !== null && /^\d{1,4}$/.test(raw) ? Number(raw) : null;
  };
  const score = read("score");
  const total = read("total");
  if (score === null || total === null) return null;
  if (total < 1 || total > MAX_SHARE_TOTAL || score > total) return null;
  return { score, total };
}
