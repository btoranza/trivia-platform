/**
 * pg currently treats sslmode=prefer|require|verify-ca as verify-full, and warns
 * that this will change in its next major version. Make today's behavior explicit.
 */
export function withExplicitSsl(connectionString: string | undefined) {
  if (!connectionString) return connectionString;
  const url = new URL(connectionString);
  const mode = url.searchParams.get("sslmode");
  if (mode && ["prefer", "require", "verify-ca"].includes(mode)) {
    url.searchParams.set("sslmode", "verify-full");
  }
  return url.toString();
}
