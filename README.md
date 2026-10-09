# Wallet

Application mobile de gestion de dépenses personnelles, construite avec **React Native** et **Expo**. Elle permet de suivre ses revenus et dépenses, d'organiser ses transactions par catégories et de respecter des budgets mensuels, le tout avec des données stockées localement sur l'appareil.

> Vos données restent sur votre appareil.

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Lancer l'application](#lancer-lapplication)
- [Structure du projet](#structure-du-projet)
- [Conventions](#conventions)
- [Dépannage](#dépannage)

## Fonctionnalités

- **Tableau de bord** : vue d'ensemble du mois, répartition des dépenses par catégorie (donut), tendance revenus/dépenses (courbes) et comparaison des dépenses aux revenus.
- **Transactions** : ajout rapide via un bouton flottant, revenus et dépenses, historique filtrable.
- **Catégories** : création, modification et suppression avec choix du type (dépense, revenu ou les deux), de l'icône et de la couleur.
- **Budgets mensuels** : un budget par catégorie, barre de progression animée, seuil d'alerte configurable et indicateur de dépassement.
- **Réglages** : thème clair/sombre sélectionnable et mémorisé, devise, export et import des données, à propos.
- **Interface native** : barre d'onglets native (Liquid Glass sur iOS 26), retours haptiques, accessibilité (rôles et libellés).

## Stack technique

| Domaine           | Outils                                                                  |
| ----------------- | ----------------------------------------------------------------------- |
| Framework         | React Native, Expo (SDK 57)                                             |
| Navigation        | Expo Router (routes basées sur les fichiers)                            |
| Langage           | TypeScript                                                              |
| Styles            | NativeWind v4 (Tailwind CSS v3) et `StyleSheet`, thème via `useTheme()` |
| Animations        | react-native-reanimated                                                 |
| Graphiques        | react-native-gifted-charts                                              |
| Feuilles modales  | @gorhom/bottom-sheet                                                    |
| Icônes            | lucide-react-native                                                     |
| Retours haptiques | expo-haptics                                                            |
| Dégradés          | expo-linear-gradient                                                    |
| État global       | `useAppStore` (`src/store`)                                             |
| Accès aux données | Repositories (`src/repositories`)                                       |

## Prérequis

- **Node.js** 20 LTS ou plus récent
- **npm** (ou yarn / pnpm)
- Un appareil ou un émulateur :
  - iOS : Xcode (version 26 pour le rendu Liquid Glass) et un simulateur
  - Android : Android Studio et un émulateur
- Pour tester sur téléphone, l'application **Expo Go** ou un build de développement (voir plus bas)

## Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/Alex20ng/wallet
cd wallet

# 2. Installer les dépendances
npm install

# 3. Vérifier que les versions sont compatibles avec le SDK Expo
npx expo install --check
```

Les packages natifs (Reanimated, Gesture Handler, Safe Area, Slider, etc.) doivent toujours être installés avec `npx expo install`, qui choisit la version compatible avec le SDK.

## Lancer l'application

```bash
# Serveur de développement
npx expo start

# Même chose en vidant le cache Metro (à faire après un changement
# de configuration NativeWind, Babel ou Metro)
npx expo start --clear
```

Ensuite, appuie sur `i` (simulateur iOS), `a` (émulateur Android) ou scanne le QR code avec Expo Go.

### Build de développement

Certaines fonctionnalités reposent sur des modules natifs. Si Expo Go ne suffit pas :

```bash
npx expo run:ios
npx expo run:android
```

Sans Mac, utilise EAS Build :

```bash
npx eas build --profile development --platform ios
```

### Vérifications

```bash
# Contrôle des types
npx tsc --noEmit
```

## Structure du projet

```
src/
├── app/                    # Routes Expo Router
│   ├── _layout.tsx         # Layout racine (providers, thème)
│   ├── (tabs)/             # Écrans principaux avec barre d'onglets
│   │   ├── _layout.tsx
│   │   ├── index.tsx       # Accueil / tableau de bord
│   │   ├── transactions.tsx
│   │   ├── categories.tsx
│   │   ├── budgets.tsx
│   │   └── settings.tsx
│   └── transaction/        # Création et édition d'une transaction
├── components/
│   ├── ui/                 # Composants de base (ThemedText, ThemedView, Button, Input, Select, Modal...)
│   ├── layout/             # Composants de mise en page (Screen, CategoryGrid, EmptyState...)
│   ├── charts/             # Graphiques (CategoryPieChart, TrendChart, BudgetProgress...)
│   └── app-tabs.tsx        # Barre d'onglets
├── constants/              # Thème (couleurs, espacements, ombres), icônes et couleurs de catégories
├── hooks/                  # use-theme, use-color-scheme, use-haptics, préférence de thème
├── repositories/           # Accès aux données (transactions, catégories, budgets)
├── services/               # Logique métier : devise, dates, export
├── store/                  # État global (useAppStore)
└── types/                  # Types TypeScript partagés
```

L'alias `@/` pointe vers `src/`.

## Conventions

### Montants en centimes

Tous les montants sont **stockés en centimes** (entiers), ce qui évite les erreurs d'arrondi. La conversion se fait à deux endroits seulement :

- à l'affichage, avec `formatCurrency(amountCents)` (`src/services/currency`) ;
- à la saisie, où la valeur entrée par l'utilisateur (en unités) est multipliée par 100 avant l'enregistrement.

### Thème

Les couleurs viennent de `useTheme()` (modes clair et sombre). Ne code pas de couleurs en dur dans les composants, sauf pour des valeurs fixes comme le blanc sur un fond coloré. Le choix clair/sombre est géré par `Appearance.setColorScheme()` et mémorisé dans AsyncStorage ; `app.json` doit contenir `"userInterfaceStyle": "automatic"`.

### Styles

- Les classes **NativeWind** (`className`) servent aux mises en page simples.
- Les valeurs **dynamiques** (couleur d'une catégorie, largeur calculée en pourcentage, valeurs du thème) restent dans `style`. Une classe Tailwind ne peut pas être construite dynamiquement (`w-${size}` ne fonctionne pas).
- `ThemedView` et `ThemedText` doivent transmettre `className` au composant natif sous-jacent.

### Animations Reanimated

- La propriété `easing` doit être une fonction `Easing` de Reanimated (par exemple `Easing.out(Easing.quad)`), jamais une fonction JavaScript ordinaire.
- Ne lis jamais `.value` d'une valeur partagée pendant le rendu d'un composant.

### Listes et clés

Chaque élément d'une liste a une clé unique. Les couleurs de catégories ne doivent pas contenir de doublons.

### Haptics

Les actions importantes (création, suppression, erreur de validation) déclenchent un retour haptique via `@/hooks/use-haptics`.

## Dépannage

| Problème                                                                  | Solution                                                                                                                                                                                       |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Les classes `className` ne s'appliquent pas                               | Vérifie `jsxImportSource: "nativewind"` dans `babel.config.js`, `withNativeWind` dans `metro.config.js`, l'import de `global.css` dans le layout racine, puis relance `npx expo start --clear` |
| `Cannot find module 'tailwindcss'` ou styles cassés                       | NativeWind v4 exige **Tailwind CSS v3** : `npm install -D tailwindcss@^3.4.17`                                                                                                                 |
| `The easing function is not a worklet`                                    | Utilise `Easing` importé de `react-native-reanimated`                                                                                                                                          |
| `Encountered two children with the same key`                              | Déduplique la liste (`Array.from(new Set(...))`)                                                                                                                                               |
| Avertissement Reanimated « Reading from `value` during component render » | Retire la lecture de `.value` dans le rendu, ou désactive le mode strict avec `configureReanimatedLogger({ strict: false })`                                                                   |
| La barre d'onglets n'a pas l'effet Liquid Glass                           | Il faut iOS 26 et un build avec Xcode 26 ; sur un iOS plus ancien, la barre classique s'affiche                                                                                                |
| Un module natif est introuvable                                           | Refais un build de développement (`npx expo run:ios` ou `run:android`)                                                                                                                         |
