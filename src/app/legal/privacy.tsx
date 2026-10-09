import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, Pressable, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { ThemedText, ThemedView } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { haptics } from '@/hooks/use-haptics';
import { spacing } from '@/constants/theme';

export default function PrivacyPolicyScreen() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();

  const handleBack = useCallback(async () => {
    await haptics.impact(haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/settings');
    }
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={[styles.header, { paddingTop: Math.max(insets.top, spacing.md) }]}>
        <Pressable
          onPress={handleBack}
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          accessibilityRole="button"
          accessibilityLabel="Retour"
        >
          <ArrowLeft size={20} strokeWidth={2.4} color={colors.textPrimary} />
        </Pressable>
        <ThemedText variant="title" weight="bold" style={styles.headerTitle}>
          Politique de Confidentialité
        </ThemedText>
        <View style={styles.headerSpacer} />
      </ThemedView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: Math.max(insets.bottom, spacing.xl) }]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText variant="body" color="tertiary" style={styles.dateText}>
          Dernière mise à jour : Octobre 2026
        </ThemedText>

        <ThemedText variant="subtitle" weight="bold" style={styles.sectionTitle}>
          1. Principes Généraux
        </ThemedText>
        <ThemedText variant="body" color="secondary" style={styles.paragraph}>
          Cette application est conçue pour fonctionner entièrement en local. Nous attachons une importance particulière à la protection de vos données personnelles et financières. Aucune donnée sensible n&apos;est collectée, transmise ou stockée sur des serveurs externes.
        </ThemedText>

        <ThemedText variant="subtitle" weight="bold" style={styles.sectionTitle}>
          2. Stockage 100% Local
        </ThemedText>
        <ThemedText variant="body" color="secondary" style={styles.paragraph}>
          Toutes les données saisies dans l'application (dépenses, revenus, catégories, budgets, historiques) sont enregistrées exclusivement sur votre appareil à l'aide d'une base de données SQLite locale. Aucune copie de ces données n&apos;est envoyée à nos serveurs, à des sous-traitants ou à des tiers.
        </ThemedText>

        <ThemedText variant="subtitle" weight="bold" style={styles.sectionTitle}>
          3. Absence de Collecte de Données
        </ThemedText>
        <ThemedText variant="body" color="secondary" style={styles.paragraph}>
          L'application ne collecte aucune donnée personnelle identifiable, aucune donnée bancaire, aucun numéro de carte, aucun identifiant de compte ou toute autre information financière sensible. Aucun traçage publicitaire, aucun SDK analytique à des fins de profilage n&apos;est utilisé.
        </ThemedText>

        <ThemedText variant="subtitle" weight="bold" style={styles.sectionTitle}>
          4. Absence de Vente ou de Partage
        </ThemedText>
        <ThemedText variant="body" color="secondary" style={styles.paragraph}>
          Nous ne vendons, ne louons, n'échangeons et ne partageons aucune donnée avec des tiers. Étant donné qu&apos;aucune donnée n&apos;est collectée à distance, aucun partage de données n&apos;est effectué.
        </ThemedText>

        <ThemedText variant="subtitle" weight="bold" style={styles.sectionTitle}>
          5. Sauvegardes & Perte de Données
        </ThemedText>
        <ThemedText variant="body" color="secondary" style={styles.paragraph}>
          Vous êtes le seul responsable de la sauvegarde de vos données. La désinstallation de l'application ou la suppression de son stockage entraînent la perte irréversible des données locales. L'éditeur ne peut être tenu responsable de la perte de données liée à la suppression de l'application, à un effacement de l&apos;appareil ou à toute autre action de l&apos;utilisateur.
        </ThemedText>

        <ThemedText variant="subtitle" weight="bold" style={styles.sectionTitle}>
          6. Droits (RGPD, CCPA)
        </ThemedText>
        <ThemedText variant="body" color="secondary" style={styles.paragraph}>
          Conformément au RGPD (UE) et au CCPA (Californie), vous disposez des droits d&apos;accès, de rectification, de limitation, d'opposition et de suppression de vos données. Dans le cadre de cette application 100% locale, ces droits s'exercent directement : vous pouvez consulter, modifier ou supprimer vos données directement dans l'application, ou les effacer complètement en désinstallant l'application.
        </ThemedText>

        <ThemedText variant="subtitle" weight="bold" style={styles.sectionTitle}>
          7. Sécurité
        </ThemedText>
        <ThemedText variant="body" color="secondary" style={styles.paragraph}>
          L'application s&apos;appuie sur les mécanismes de stockage sécurisé offerts par le système d'exploitation de votre appareil. Aucune transmission réseau n&apos;est initiée pour vos données financières. Toutefois, la sécurité globale de votre appareil reste sous votre responsabilité.
        </ThemedText>

        <ThemedText variant="subtitle" weight="bold" style={styles.sectionTitle}>
          8. Contact
        </ThemedText>
        <ThemedText variant="body" color="secondary" style={styles.paragraph}>
          Pour toute question relative à la présente politique de confidentialité, vous pouvez vous référer aux présentes mentions. Cette politique peut être mise à jour ponctuellement ; la date de dernière mise à jour est indiquée en haut de cette page.
        </ThemedText>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: spacing.sm },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center' },
  headerSpacer: { width: 40 },
  scrollView: { flex: 1 },
  contentContainer: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  dateText: { marginBottom: spacing.lg },
  sectionTitle: { marginBottom: spacing.sm, marginTop: spacing.lg },
  paragraph: { marginBottom: spacing.md, lineHeight: 22 },
});
