// URL racine du site en production.
// À définir dans l'environnement de build (Vercel) : EXPO_PUBLIC_SITE_URL
// Exemple : EXPO_PUBLIC_SITE_URL=https://wallet.alex20ng.site
// Tant qu'elle n'est pas définie, les URL absolues (canoniques, OG, sitemap,
// llms.txt) sont omises pour ne jamais pointer vers un domaine inventé.
export const SITE_URL: string = (
  process.env.EXPO_PUBLIC_SITE_URL ?? ""
).replace(/\/+$/, "");

export const APP_NAME = "Wallet";

export const OG_IMAGE_PATH = "/icons/og-image.png";

export function absoluteUrl(path: string): string {
  if (!SITE_URL) return "";
  if (!path || path === "/") return SITE_URL;
  return SITE_URL + (path.startsWith("/") ? path : `/${path}`);
}
