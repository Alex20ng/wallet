// URL racine du site en production.
// Surchargeable au build via EXPO_PUBLIC_SITE_URL (recommandé pour les
// previews), avec le domaine de production comme valeur par défaut.
export const SITE_URL: string = (
  process.env.EXPO_PUBLIC_SITE_URL ?? "https://wallet.alex20ng.site"
).replace(/\/+$/, "");

export const APP_NAME = "Wallet";

export const OG_IMAGE_PATH = "/icons/og-image.png";

// Dimensions réelles de l'image de partage (1200x630). Les fournir évite aux
// crawlers (Facebook, WhatsApp, X…) de devoir télécharger l'image avant
// d'afficher l'aperçu, et garantit un rendu correct du format large.
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

export const OG_IMAGE_ALT =
  "Wallet — application de gestion de budget et de dépenses personnelles";

// Langue principale du site et langues alternatives (toutes les pages
// publiques existent en français et en anglais).
export const OG_LOCALE = "fr_FR";
export const OG_LOCALE_ALTERNATE = ["en_US"];

// Compte X/Twitter du site, utilisé par les balises `twitter:site` et
// `twitter:creator`. Laisser vide pour ne pas émettre ces balises.
export const TWITTER_SITE = "";

export function absoluteUrl(path: string): string {
  if (!SITE_URL) return "";
  if (!path || path === "/") return SITE_URL;
  return SITE_URL + (path.startsWith("/") ? path : `/${path}`);
}
