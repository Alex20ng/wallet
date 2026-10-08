import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { ThemedText, Button } from '../ui';
import { useTheme } from '../../hooks/use-theme';
import { spacing, borderRadius } from '../../constants/theme';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  const colors = useTheme();

  return (
    <View style={[styles.container, style]}>
      {icon ? (
        <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
          {icon}
        </View>
      ) : null}
      <ThemedText variant="subtitle" weight="bold" color="primary" style={styles.title}>
        {title}
      </ThemedText>
      <ThemedText variant="body" color="tertiary" style={styles.message}>
        {message}
      </ThemedText>
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} variant="primary" size="md" style={styles.actionButton} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    borderRadius: borderRadius.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  message: {
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  actionButton: {
    minWidth: 180,
  },
});

export default EmptyState;
