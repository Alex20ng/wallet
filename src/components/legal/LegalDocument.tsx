import { ThemedText, ThemedView } from "@/components/ui";
import { spacing } from "@/constants/theme";
import { haptics } from "@/hooks/use-haptics";
import { useTheme } from "@/hooks/use-theme";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { ReactNode, useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

interface LegalDocumentProps {
  title: string;
  date: string;
  children: ReactNode;
}

export function LegalDocument({ title, date, children }: LegalDocumentProps) {
  const colors = useTheme();
  const insets = useSafeAreaInsets();

  const handleBack = useCallback(async () => {
    await haptics.impact(haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/settings");
    }
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
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
          accessibilityLabel="Retour"
        >
          <ArrowLeft size={20} strokeWidth={2.4} color={colors.textPrimary} />
        </Pressable>
        <ThemedText variant="title" weight="bold" style={styles.headerTitle}>
          {title}
        </ThemedText>
        <View style={styles.headerSpacer} />
      </ThemedView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: Math.max(insets.bottom, spacing.xl) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText variant="body" color="tertiary" style={styles.dateText}>
          Dernière mise à jour : {date}
        </ThemedText>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <ThemedText variant="subtitle" weight="bold" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      <ThemedText variant="body" color="secondary" style={styles.paragraph}>
        {children}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  headerTitle: { flex: 1, textAlign: "center" },
  headerSpacer: { width: 40 },
  scrollView: { flex: 1 },
  contentContainer: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  dateText: { marginBottom: spacing.lg },
  section: { marginBottom: spacing.lg },
  sectionTitle: { marginBottom: spacing.sm, marginTop: spacing.lg },
  paragraph: { marginBottom: spacing.md, lineHeight: 22 },
});
