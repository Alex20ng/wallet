import "react-native";

// React Native Web mappe `aria-level` vers le niveau de titre HTML
// (<h1>…<h6>) lorsque le rôle est "heading", mais la propriété est absente
// des types React Native. On l'ajoute pour pouvoir écrire des titres
// sémantiques corrects (hiérarchie h1/h2/h3) côté web sans cast.
declare module "react-native" {
  interface AccessibilityProps {
    "aria-level"?: number | undefined;
  }
}