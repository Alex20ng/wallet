import { PublicHead } from "@/components/seo/public-head";
import { ThemedText, ThemedView } from "@/components/ui";
import { absoluteUrl, APP_NAME, OG_IMAGE_PATH } from "@/constants/seo";
import { borderRadius, shadows, spacing, typography } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { haptics } from "@/hooks/use-haptics";
import { useTranslation } from "@/i18n";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Image } from "expo-image";
import { Link, router } from "expo-router";
import {
  ArrowLeft,
  ArrowRight,
  BellRing,
  ChartPie,
  CloudOff,
  DatabaseBackup,
  Landmark,
  Palette,
  Tags,
  TrendingUp,
} from "lucide-react-native";
import { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const LOGO = require("../../assets/images/splash-icon.png");

const LANDING_COPY = {
  fr: {
    badge: "App de finances personnelles 100 % hors ligne",
    title: "Pilotez vos dépenses et votre budget, sans compte ni cloud",
    subtitle:
      "Wallet est une application de gestion de finances personnelles qui fonctionne hors ligne sur Android, iOS et le web. Suivez vos transactions, organisez votre budget par catégorie et gardez le contrôle de votre argent — tout reste sur votre appareil.",
    cta: "Ouvrir l'application",
    ctaSecondary: "Voir les fonctionnalités",
    featuresTitle: "Tout pour maîtriser vos finances au quotidien",
    featuresSubtitle:
      "Des fonctionnalités concrètes, pensées pour une utilisation simple et privée.",
    features: [
      {
        icon: TrendingUp,
        title: "Suivi des revenus et dépenses",
        description:
          "Enregistrez chaque transaction, distinguez revenus et dépenses, et visualisez votre solde sur la période de votre choix.",
      },
      {
        icon: ChartPie,
        title: "Budgets mensuels par catégorie",
        description:
          "Définissez des budgets par catégorie, suivez votre progression en temps réel et anticipez les dépassements.",
      },
      {
        icon: Tags,
        title: "Catégories personnalisées",
        description:
          "Organisez vos dépenses avec des catégories que vous créez, avec une icône et une couleur qui vous correspondent.",
      },
      {
        icon: BellRing,
        title: "Rappels et alertes",
        description:
          "Recevez un rappel pour saisir vos dépenses du jour et des alertes lorsqu'un budget approche de sa limite.",
      },
      {
        icon: Landmark,
        title: "Revenus, dépenses et devises multiples",
        description:
          "Gérez plusieurs devises et suivez précisément chaque entrée d'argent et chaque sortie.",
      },
      {
        icon: DatabaseBackup,
        title: "Sauvegarde et export",
        description:
          "Sauvegardez vos données en un fichier JSON, exportez vos transactions en CSV et importez-les quand vous voulez.",
      },
      {
        icon: CloudOff,
        title: "100 % hors ligne et privé",
        description:
          "Aucun compte, aucune synchronisation cloud : vos données financières restent stockées localement sur votre appareil.",
      },
      {
        icon: Palette,
        title: "Personnalisation",
        description:
          "Mode sombre, choix de la langue (français ou anglais) et devises multiples pour une expérience à votre image.",
      },
    ],
    publicTitle: "La transparence de vos données",
    publicText:
      "Toutes les données sont conservées sur votre appareil — en SQLite sur mobile et dans le stockage local de votre navigateur web. Aucune donnée personnelle ou financière n'est envoyée à un serveur.",
    faqTitle: "Questions fréquentes",
    faq: [
      {
        q: "Mes données financières sont-elles envoyées sur un serveur ?",
        a: "Non. Wallet fonctionne entièrement hors ligne : vos transactions et budgets sont stockés localement sur votre appareil (SQLite sur mobile, IndexedDB dans le navigateur). Aucun compte n'est requis.",
      },
      {
        q: "Puis-je sauvegarder ou transférer mes données ?",
        a: "Oui. Vous pouvez exporter une sauvegarde complète au format JSON, exporter vos transactions en CSV, ou importer un fichier de sauvegarde pour restaurer vos données.",
      },
      {
        q: "Sur quelles plateformes Wallet est-il disponible ?",
        a: "Wallet est disponible sur Android, iOS et en version web (application web progressiste, installable et utilisable hors ligne).",
      },
      {
        q: "Comment commencer ?",
        a: "Aucune inscription n'est nécessaire. Ouvrez l'application, ajoutez vos premières transactions, créez des catégories et définissez vos budgets : vous avez déjà un aperçu de votre situation.",
      },
    ],
    appTitle: "Prêt à reprendre le contrôle sur votre argent ?",
    footerNote:
      "Application gratuite et open source, développée avec React Native et Expo.",
    footer: {
      app: "L'application",
      legal: "Mentions légales",
      terms: "Conditions d'utilisation",
      privacy: "Politique de confidentialité",
    },
  },
  en: {
    badge: "100 % offline personal finance app",
    title: "Take control of your spending and budget, no account or cloud",
    subtitle:
      "Wallet is a personal finance app that works offline on Android, iOS and the web. Track your transactions, organise your budget by category and stay in control of your money — everything stays on your device.",
    cta: "Open the app",
    ctaSecondary: "See the features",
    featuresTitle: "Everything you need to master your finances daily",
    featuresSubtitle:
      "Practical, simple and privacy-first features for everyday use.",
    features: [
      {
        icon: TrendingUp,
        title: "Income and expense tracking",
        description:
          "Record every transaction, separate income from expenses, and view your balance over any period.",
      },
      {
        icon: ChartPie,
        title: "Monthly budgets by category",
        description:
          "Set budgets per category, track your progress in real time and anticipate overspending.",
      },
      {
        icon: Tags,
        title: "Custom categories",
        description:
          "Organise your spending with categories you create, with an icon and colour that suit you.",
      },
      {
        icon: BellRing,
        title: "Reminders and alerts",
        description:
          "Get a reminder to log your daily expenses and alerts when a budget approaches its limit.",
      },
      {
        icon: Landmark,
        title: "Multiple currencies",
        description:
          "Work with several currencies and track every money in and money out precisely.",
      },
      {
        icon: DatabaseBackup,
        title: "Backup and export",
        description:
          "Back up your data to a JSON file, export your transactions to CSV and import them whenever you need.",
      },
      {
        icon: CloudOff,
        title: "100 % offline and private",
        description:
          "No account, no cloud sync: your financial data stays stored locally on your device.",
      },
      {
        icon: Palette,
        title: "Customisation",
        description:
          "Dark mode, language choice (French or English) and multiple currencies for an experience that fits you.",
      },
    ],
    publicTitle: "Your data stays transparent",
    publicText:
      "All data is stored on your device — in SQLite on mobile and in your web browser's local storage. No personal or financial data is ever sent to a server.",
    faqTitle: "Frequently asked questions",
    faq: [
      {
        q: "Is my financial data sent to a server?",
        a: "No. Wallet works fully offline: your transactions and budgets are stored locally on your device (SQLite on mobile, IndexedDB in the browser). No account is required.",
      },
      {
        q: "Can I back up or transfer my data?",
        a: "Yes. You can export a full backup as JSON, export your transactions as CSV, or import a backup file to restore your data.",
      },
      {
        q: "Which platforms does Wallet support?",
        a: "Wallet is available on Android, iOS and as a web app (a progressive web app that can be installed and used offline).",
      },
      {
        q: "How do I get started?",
        a: "No sign-up is needed. Open the app, add your first transactions, create categories and set budgets: you instantly get a picture of your situation.",
      },
    ],
    appTitle: "Ready to take back control of your money?",
    footerNote: "Free app developed with React Native and Expo.",
    footer: {
      app: "The app",
      legal: "Legal",
      terms: "Terms of use",
      privacy: "Privacy policy",
    },
  },
} as const;

export default function DocsScreen() {
  return <DocsContent />;
}

function DocsContent() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const language = useSettingsStore((state) => state.language);
  const copy = LANDING_COPY[language];

  const handleBack = useCallback(async () => {
    await haptics.impact(haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/settings");
    }
  }, []);

  const canonical = absoluteUrl("/docs");

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: APP_NAME,
      description: copy.subtitle,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Android, iOS, Web",
      url: canonical,
      ...(canonical ? { image: absoluteUrl(OG_IMAGE_PATH) } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: APP_NAME,
      description: copy.subtitle,
      url: canonical,
    },
  ];

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <PublicHead
        title={`${APP_NAME} — Gestion de budget et de dépenses personnelles`}
        description={copy.subtitle}
        path="/docs"
        jsonLd={jsonLd}
      />
      <ThemedView
        style={[
          styles.header,
          { paddingTop: Math.max(insets.top, spacing.md) },
        ]}
      >
        <Pressable
          onPress={handleBack}
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          accessibilityRole="button"
          accessibilityLabel={t("common.back")}
        >
          <ArrowLeft size={20} strokeWidth={2.4} color={colors.textPrimary} />
        </Pressable>
      </ThemedView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.page}>
          <View role="main">
            {/* Hero */}
            <View role="banner" style={styles.hero}>
              <View style={styles.logoWrapper}>
                <Image
                  source={LOGO}
                  style={styles.logo}
                  contentFit="contain"
                  accessibilityLabel="Logo Wallet"
                />
              </View>
              <ThemedText
                variant="caption"
                color="tertiary"
                style={styles.badge}
              >
                {copy.badge}
              </ThemedText>
              <ThemedText
                variant="display"
                weight="bold"
                style={styles.title}
                role="heading"
                aria-level={1}
              >
                {copy.title}
              </ThemedText>
              <ThemedText
                variant="body"
                color="secondary"
                style={styles.subtitle}
              >
                {copy.subtitle}
              </ThemedText>
              <View style={styles.ctaRow}>
                <Link href="/" asChild>
                  <Pressable
                    accessibilityRole="link"
                    style={({ pressed }) => [
                      styles.ctaPrimary,
                      { backgroundColor: colors.primary },
                      pressed && styles.ctaPressed,
                    ]}
                  >
                    <ThemedText
                      variant="body"
                      weight="semibold"
                      color="inverse"
                    >
                      {copy.cta}
                    </ThemedText>
                    <ArrowRight size={18} color={colors.textInverse} />
                  </Pressable>
                </Link>
                <Link href="/docs#features" asChild>
                  <Pressable
                    accessibilityRole="link"
                    style={({ pressed }) => [
                      styles.ctaSecondary,
                      { backgroundColor: colors.surface },
                      pressed && styles.ctaPressed,
                    ]}
                  >
                    <ThemedText
                      variant="body"
                      weight="semibold"
                      color="primary"
                    >
                      {copy.ctaSecondary}
                    </ThemedText>
                  </Pressable>
                </Link>
              </View>
            </View>

            {/* Features */}
            <ThemedView variant="surface" style={styles.section} role="region">
              <ThemedText
                variant="title"
                weight="bold"
                style={styles.sectionTitle}
                role="heading"
                aria-level={2}
              >
                {copy.featuresTitle}
              </ThemedText>
              <ThemedText
                variant="body"
                color="secondary"
                style={styles.sectionSubtitle}
              >
                {copy.featuresSubtitle}
              </ThemedText>
              <View style={styles.featuresGrid} nativeID="features">
                {copy.features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <ThemedView
                      key={feature.title}
                      variant="elevated"
                      style={styles.featureCard}
                      role="article"
                    >
                      <View
                        style={[
                          styles.featureIcon,
                          { backgroundColor: colors.primaryLight },
                        ]}
                      >
                        <Icon
                          size={20}
                          strokeWidth={2.2}
                          color={colors.primary}
                        />
                      </View>
                      <ThemedText
                        variant="subtitle"
                        weight="semibold"
                        style={styles.featureTitle}
                        role="heading"
                        aria-level={3}
                      >
                        {feature.title}
                      </ThemedText>
                      <ThemedText variant="body" color="secondary">
                        {feature.description}
                      </ThemedText>
                    </ThemedView>
                  );
                })}
              </View>
            </ThemedView>

            {/* Privacy */}
            <ThemedView variant="surface" style={styles.section}>
              <ThemedText
                variant="title"
                weight="bold"
                style={styles.sectionTitle}
                role="heading"
                aria-level={2}
              >
                {copy.publicTitle}
              </ThemedText>
              <ThemedText
                variant="body"
                color="secondary"
                style={styles.sectionSubtitle}
              >
                {copy.publicText}
              </ThemedText>
            </ThemedView>

            {/* FAQ */}
            <ThemedView variant="surface" style={styles.section}>
              <ThemedText
                variant="title"
                weight="bold"
                style={styles.sectionTitle}
                role="heading"
                aria-level={2}
              >
                {copy.faqTitle}
              </ThemedText>
              {copy.faq.map((item) => (
                <View key={item.q} style={styles.faqItem}>
                  <ThemedText variant="subtitle" weight="semibold">
                    {item.q}
                  </ThemedText>
                  <ThemedText variant="body" color="secondary">
                    {item.a}
                  </ThemedText>
                </View>
              ))}
            </ThemedView>
          </View>

          {/* Footer */}
          <View role="contentinfo" style={styles.footer}>
            <ThemedText
              variant="title"
              weight="bold"
              style={styles.footerTitle}
            >
              {copy.appTitle}
            </ThemedText>
            <Link href="/" asChild>
              <Pressable
                accessibilityRole="link"
                style={({ pressed }) => [
                  styles.ctaPrimary,
                  { backgroundColor: colors.primary },
                  pressed && styles.ctaPressed,
                ]}
              >
                <ThemedText variant="body" weight="semibold" color="inverse">
                  {copy.cta}
                </ThemedText>
                <ArrowRight size={18} color={colors.textInverse} />
              </Pressable>
            </Link>
            <ThemedText
              variant="caption"
              color="tertiary"
              style={styles.footerNote}
            >
              {copy.footerNote}
            </ThemedText>
            <View style={styles.footerLinks}>
              <Link href="/legal/terms">
                <ThemedText variant="caption" color="link">
                  {copy.footer.terms}
                </ThemedText>
              </Link>
              <Link href="/legal/privacy">
                <ThemedText variant="caption" color="link">
                  {copy.footer.privacy}
                </ThemedText>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  page: {
    width: "100%",
    maxWidth: 1080,
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  hero: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  logoWrapper: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    ...shadows.lg,
  },
  logo: {
    width: 88,
    height: 88,
  },
  badge: {
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    textAlign: "center",
    maxWidth: 720,
    marginBottom: spacing.md,
  },
  subtitle: {
    textAlign: "center",
    maxWidth: 620,
    marginBottom: spacing.lg,
  },
  ctaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.sm,
  },
  ctaPrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    ...shadows.md,
  },
  ctaSecondary: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
  },
  ctaPressed: {
    opacity: 0.85,
  },
  section: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.xs,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    marginBottom: spacing.md,
    maxWidth: 640,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  featureCard: {
    flexBasis: "100%",
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  featureTitle: {
    fontSize: typography.fontSize.lg,
  },
  faqItem: {
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  footer: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  footerTitle: {
    textAlign: "center",
    maxWidth: 560,
  },
  footerNote: {
    textAlign: "center",
  },
  footerLinks: {
    flexDirection: "row",
    gap: spacing.lg,
  },
});
