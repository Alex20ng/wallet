import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

// Fichier web uniquement : racine HTML de chaque page rendue en statique
// (exécuté dans Node.js, sans accès au DOM ni aux API navigateur).

// Le Service Worker n'est généré que par le build de production
// (`npm run build:web`). En développement, `/sw.js` n'existe pas :
// tenter de l'enregistrer provoque une erreur d'installation dans la console.
const isProduction = process.env.NODE_ENV === "production";

const serviceWorkerScript = `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('Service Worker registered with scope:', registration.scope);
    }).catch(error => {
      console.error('Service Worker registration failed:', error);
    });
  });
}
`;

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        <meta
          name="theme-color"
          content="#10B981"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#0F172A"
          media="(prefers-color-scheme: dark)"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />

        <style>
          {`html, body { background-color: #F8FAFC; }
@media (prefers-color-scheme: dark) {
  html, body { background-color: #0F172A; }
}`}
        </style>

        {isProduction ? (
          <script dangerouslySetInnerHTML={{ __html: serviceWorkerScript }} />
        ) : null}

        {/*
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native.
        */}
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
