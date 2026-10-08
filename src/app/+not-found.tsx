import React from 'react';
import { router } from 'expo-router';
import { ThemedView, ThemedText, Button } from '@/components/ui';
import { Screen } from '@/components/layout';
import { spacing, borderRadius } from '@/constants/theme';

import { StyleSheet } from 'react-native';

export default function NotFoundScreen() {
  return (
    <Screen scrollable={false} style={styles.container}>
      <ThemedView variant="elevated" style={styles.card}>
        <ThemedText variant="display" color="tertiary" style={styles.icon}>
          🔍
        </ThemedText>
        <ThemedText variant="headline" weight="bold" style={styles.title}>
          Page introuvable
        </ThemedText>
        <ThemedText variant="body" color="secondary" style={styles.message}>
          Cette page n&apos;existe pas ou a été déplacée.
        </ThemedText>
        <Button
          title="Retour à l&apos;accueil"
          onPress={() => router.replace('/')}
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  icon: {
    marginBottom: spacing.md,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  button: {
    minWidth: 200,
  },
});