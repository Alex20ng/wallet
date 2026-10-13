import Head from "expo-router/head";
import { APP_NAME, absoluteUrl, OG_IMAGE_PATH } from "@/constants/seo";

type PublicHeadProps = {
  title: string;
  description: string;
  path: string;
  robots?: string;
  ogType?: "website" | "article";
  image?: string;
  jsonLd?: Record<string, unknown>[];
};

/**
 * Métadonnées SEO des pages publiques indexables. Rendu côté serveur (export
 * statique) ET mis à jour côté client lors de la navigation SPA grâce à
 * `expo-router/head` (react-helmet-async). Sans effet sur Android/iOS.
 */
export function PublicHead({
  title,
  description,
  path,
  robots = "index,follow",
  ogType = "website",
  image = OG_IMAGE_PATH,
  jsonLd,
}: PublicHeadProps) {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      {url ? <link rel="canonical" href={url} /> : null}
      {url ? <meta property="og:url" content={url} /> : null}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:locale" content="fr_FR" />
      <meta property="og:site_name" content={APP_NAME} />
      <meta
        name="twitter:card"
        content={imageUrl ? "summary_large_image" : "summary"}
      />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {imageUrl ? <meta property="og:image" content={imageUrl} /> : null}
      {imageUrl ? <meta name="twitter:image" content={imageUrl} /> : null}
      {jsonLd?.map((schema) => (
        <script key={schema["@type"] as string} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Head>
  );
}

/**
 * Balise robots noindex pour les écrans privés (données financières
 * personnelles) : jamais exposés à l'indexation.
 */
export function NoIndexHead() {
  return (
    <Head>
      <meta name="robots" content="noindex,nofollow" />
    </Head>
  );
}