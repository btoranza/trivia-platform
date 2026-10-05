/**
 * Public address of the site, with protocol, or undefined when it is unknown.
 * SITE_URL wins; on Vercel the production domain is used. Empty values count
 * as unset, hence || rather than ??.
 */
export function siteUrl(): string | undefined {
  const host =
    process.env.SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (!host) return undefined;
  return host.startsWith("http") ? host : `https://${host}`;
}
