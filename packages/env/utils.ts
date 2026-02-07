export function getWebsiteUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  const vercelUrl =
    process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }

  return "http://localhost:3000";
}
