// URL racine du site en production.
// Surchargeable au build via EXPO_PUBLIC_SITE_URL (recommandé pour les
// previews), avec le domaine de production comme valeur par défaut.
export const SITE_URL: string = (
  process.env.EXPO_PUBLIC_SITE_URL ?? "https://wallet.alex20ng.site"
).replace(/\/+$/, "");

export const APP_NAME = "Wallet";

export const OG_IMAGE_PATH = "/icons/og-image.png";

export function absoluteUrl(path: string): string {
  if (!SITE_URL) return "";
  if (!path || path === "/") return SITE_URL;
  return SITE_URL + (path.startsWith("/") ? path : `/${path}`);
}
