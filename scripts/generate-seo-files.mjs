/**
 * Génère les fichiers SEO statiques (robots.txt, sitemap.xml, llms.txt).
 *
 * URL du site (priorité) :
 *   1. EXPO_PUBLIC_SITE_URL  (variable d'environnement du build)
 *   2. VERCEL_PROJECT_PRODUCTION_URL (injectée automatiquement par Vercel)
 *
 * Si aucune URL n'est disponible, le script écrit quand même un robots.txt
 * (sans Sitemap) et refuse d'inventer un domaine : sitemap.xml et llms.txt
 * ne sont pas générés, avec un avertissement explicite.
 *
 * Les fichiers sont écrits dans public/ (serveur de dev) et, si présent,
 * dans dist/ (sortie de `expo export`, utilisée par Vercel).
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const today = new Date().toISOString().slice(0, 10);

const PUBLIC_PATHS = ["/", "/legal/terms", "/legal/privacy"];

// Chemins privés (données financières de l'utilisateur) à exclure de
// l'indexation. Ils sont par ailleurs marqués noindex dans le HTML généré.
const DISALLOWED_PATHS = [
  "/home",
  "/transactions",
  "/categories",
  "/budgets",
  "/settings",
  "/transaction",
  "/category-form",
];

function resolveSiteUrl() {
  const explicit = process.env.EXPO_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelUrl) return `https://${vercelUrl}`;
  return "";
}

function logInfo(message) {
  console.log(`[generate-seo] ${message}`);
}

function logWarn(message) {
  console.warn(`[generate-seo] AVERTISSEMENT : ${message}`);
}

function write(targets, name, content) {
  for (const dir of targets) {
    const file = join(dir, name);
    mkdirSync(dir, { recursive: true });
    writeFileSync(file, content);
    logInfo(`écrit ${file}`);
  }
}

function main() {
  const siteUrl = resolveSiteUrl();

  const targets = [join(root, "public")];
  const distDir = join(root, "dist");
  if (existsSync(distDir)) targets.push(distDir);

  const robots = [
    "User-agent: *",
    "Allow: /",
    ...DISALLOWED_PATHS.map((p) => `Disallow: ${p}`),
    "",
    ...(siteUrl ? [`Sitemap: ${siteUrl}/sitemap.xml`] : []),
    "",
  ].join("\n");

  write(targets, "robots.txt", robots);

  if (!siteUrl) {
    logWarn(
      "Aucune URL de site (EXPO_PUBLIC_SITE_URL ou VERCEL_PROJECT_PRODUCTION_URL) " +
        "n'est définie : sitemap.xml et llms.txt ne sont pas générés pour éviter " +
        "d'utiliser un domaine inventé."
    );
    logInfo(
      "Conseil : définir EXPO_PUBLIC_SITE_URL dans le tableau de bord Vercel " +
        "(ex. https://wallet.alex20ng.com), puis reconstruire."
    );
    return;
  }

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...PUBLIC_PATHS.map(
      (p) =>
        `  <url><loc>${siteUrl}${p === "/" ? "" : p}</loc><lastmod>${today}</lastmod></url>`
    ),
    "</urlset>",
    "",
  ].join("\n");

  write(targets, "sitemap.xml", sitemap);

  const llms = [
    `# Wallet`,
    "",
    "Gestionnaire de budget et de dépenses personnelles, 100 % hors ligne, " +
      "sans compte ni synchronisation cloud. Disponible sur Android, iOS et web (PWA).",
    "",
    "Fonctionnalités : suivi des revenus et dépenses, budgets mensuels par " +
      "catégorie, catégories personnalisées, rappels et alertes locales, " +
      "devises multiples, mode sombre, français/anglais, sauvegarde JSON et " +
      "export CSV.",
    "",
    "Confidentialité : toutes les données restent stockées localement sur " +
      "l'appareil (SQLite sur mobile, IndexedDB sur le web). Aucune donnée " +
      "n'est envoyée à un serveur.",
    "",
    "## Liens",
    "",
    `- [Page d'accueil](${siteUrl}/)`,
    `- [Conditions d'utilisation](${siteUrl}/legal/terms)`,
    `- [Politique de confidentialité](${siteUrl}/legal/privacy)`,
    "- [Ouvrir l'application](/home)",
    "",
  ].join("\n");

  write(targets, "llms.txt", llms);

  logInfo(`done (${siteUrl})`);
}

main();