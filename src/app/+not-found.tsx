import { Screen } from "@/components/layout";
import { NoIndexHead } from "@/components/seo/public-head";
import { Button, ThemedText, ThemedView } from "@/components/ui";
import { borderRadius, spacing } from "@/constants/theme";
import { useTranslation } from "@/i18n";
import { router } from "expo-router";

import { StyleSheet } from "react-native";

export default function NotFoundScreen() {
  const { t } = useTranslation();
  return (
    <Screen scrollable={false} style={styles.container}>
      <NoIndexHead />
      <ThemedView variant="elevated" style={styles.card}>
        <ThemedText variant="display" color="tertiary" style={styles.icon}>
          🔍
        </ThemedText>
        <ThemedText variant="headline" weight="bold" style={styles.title}>
          {t("notFound.title")}
        </ThemedText>
        <ThemedText variant="body" color="secondary" style={styles.message}>
          {t("notFound.message")}
        </ThemedText>
        <Button
          title={t("notFound.backHome")}
          onPress={() => router.replace("/")}
          variant="primary"
          size="lg"
          fullWidth
          style={styles.button}
        />
      </ThemedView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  card: {
    width: "100%",
    maxWidth: 320,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    alignItems: "center",
  },
  icon: {
    marginBottom: spacing.md,
  },
  title: {
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  message: {
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  button: {
    minWidth: 200,
  },
});
