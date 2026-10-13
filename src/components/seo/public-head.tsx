import {
  absoluteUrl,
  APP_NAME,
  OG_IMAGE_ALT,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_PATH,
  OG_IMAGE_WIDTH,
  OG_LOCALE,
  OG_LOCALE_ALTERNATE,
  TWITTER_SITE,
} from "@/constants/seo";
import Head from "expo-router/head";

type PublicHeadProps = {
  title: string;
  description: string;
  path: string;
  robots?: string;
  ogType?: "website" | "article";
  image?: string;
  imageAlt?: string;
  locale?: string;
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
  imageAlt = OG_IMAGE_ALT,
  locale = OG_LOCALE,
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
      <meta property="og:locale" content={locale} />
      {OG_LOCALE_ALTERNATE.filter((alt) => alt !== locale).map((alt) => (
        <meta key={alt} property="og:locale:alternate" content={alt} />
      ))}
      <meta property="og:site_name" content={APP_NAME} />
      <meta
        name="twitter:card"
        content={imageUrl ? "summary_large_image" : "summary"}
      />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {TWITTER_SITE ? (
        <meta name="twitter:site" content={TWITTER_SITE} />
      ) : null}
      {TWITTER_SITE ? (
        <meta name="twitter:creator" content={TWITTER_SITE} />
      ) : null}
      {imageUrl ? <meta property="og:image" content={imageUrl} /> : null}
      {imageUrl ? (
        <meta property="og:image:secure_url" content={imageUrl} />
      ) : null}
      {imageUrl ? <meta property="og:image:type" content="image/png" /> : null}
      {imageUrl ? (
        <meta property="og:image:width" content={String(OG_IMAGE_WIDTH)} />
      ) : null}
      {imageUrl ? (
        <meta property="og:image:height" content={String(OG_IMAGE_HEIGHT)} />
      ) : null}
      {imageUrl ? <meta property="og:image:alt" content={imageAlt} /> : null}
      {imageUrl ? <meta name="twitter:image" content={imageUrl} /> : null}
      {imageUrl ? <meta name="twitter:image:alt" content={imageAlt} /> : null}
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
