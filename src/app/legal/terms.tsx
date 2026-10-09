import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, Pressable, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { ThemedText, ThemedView } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { haptics } from '@/hooks/use-haptics';
import { spacing, borderRadius } from '@/constants/theme';

export default function TermsOfServiceScreen() {
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
          Conditions Générales d'Utilisation
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
          Article 1 - Objet
        </ThemedText>
        <ThemedText variant="body" color="secondary" style={styles.paragraph}>
          La présente application est un outil d'aide à la gestion de budget personnel à titre indicatif. Elle permet à l&apos;utilisateur de saisir, d'organiser et de visualiser ses dépenses, revenus, catégories et budgets. L'utilisation de cette application ne saurait se substituer à des conseils financiers, fiscaux ou juridiques professionnels.
        </ThemedText>

        <ThemedText variant="subtitle" weight="bold" style={styles.sectionTitle}>
          Article 2 - Fonctionnement et Stockage des Données
        </ThemedText>
        <ThemedText variant="body" color="secondary" style={styles.paragraph}>
          Cette application fonctionne en mode "Offline-First". L'intégralité des données (transactions, catégories, budgets) est stockée exclusivement sur l'appareil de l'utilisateur via une base de données SQLite locale. Aucune donnée n'est transmise, hébergée ou synchronisée sur nos serveurs.
        </ThemedText>
        <ThemedText variant="body" color="secondary" style={styles.paragraph}>
          La sauvegarde, la restauration, la sécurité et la gestion des données relèvent de la seule responsabilité de l'utilisateur. La désinstallation de l'application entraîne la suppression définitive des données locales qui y sont associées.
        </ThemedText>

        <ThemedText variant="subtitle" weight="bold" style={styles.sectionTitle}>
          Article 3 - Absence de Conseil Financier
        </ThemedText>
        <ThemedText variant="body" color="secondary" style={styles.paragraph}>
          L'application ne fournit aucun conseil financier, investissement, fiscal ou juridique. Les informations et statistiques affichées sont issues des données saisies par l'utilisateur et sont données à titre purement indicatif. L'éditeur ne saurait être tenu responsable des erreurs de saisie, des décisions financières, économiques ou patrimoniales prises par l'utilisateur sur la base de ces informations.
        </ThemedText>

        <ThemedText variant="subtitle" weight="bold" style={styles.sectionTitle}>
          Article 4 - Absence de Collecte et de Revente
        </ThemedText>
        <ThemedText variant="body" color="secondary" style={styles.paragraph}>
          L'éditeur ne collecte, n'enregistre, ne traite, ne vend ni ne loue aucune donnée personnelle ou financière. Aucun identifiant, aucune donnée bancaire, aucun identifiant de transaction tierce n'est collecté par l'application.
        </ThemedText>

        <ThemedText variant="subtitle" weight="bold" style={styles.sectionTitle}>
          Article 5 - Exclusion de Responsabilité
        </ThemedText>
        <ThemedText variant="body" color="secondary" style={styles.paragraph}>
          Dans les limites autorisées par la loi, l&apos;éditeur décline toute responsabilité en cas de perte de données, de dysfonctionnement, d'erreur de calcul, de dommage indirect ou de tout autre préjudice résultant de l'utilisation ou de l&apos;impossibilité d'utiliser l'application.
        </ThemedText>

        <ThemedText variant="subtitle" weight="bold" style={styles.sectionTitle}>
          Article 6 - Propriété Intellectuelle
        </ThemedText>
        <ThemedText variant="body" color="secondary" style={styles.paragraph}>
          L'ensemble des éléments de l'application (code source, conception, interfaces, graphismes, logos, textes) est protégé par le droit de la propriété intellectuelle. Toute reproduction, représentation, modification, distribution ou exploitation, partielle ou totale, est interdite sans autorisation préalable de l&apos;éditeur.
        </ThemedText>

        <ThemedText variant="subtitle" weight="bold" style={styles.sectionTitle}>
          Article 7 - Droit Applicable
        </ThemedText>
        <ThemedText variant="body" color="secondary" style={styles.paragraph}>
          Les présentes CGU sont régies par le droit français. Tout litige relatif à leur interprétation ou à leur exécution relève de la compétence des juridictions françaises.
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
