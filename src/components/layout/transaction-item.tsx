import React, { memo } from 'react';
import { Pressable, StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../hooks/use-theme';
import { ThemedText } from '../ui';
import { spacing, borderRadius, typography } from '../../constants/theme';
import { formatCurrency, formatDate } from '../../services/currency';
import { getCategoryIcon } from '../../constants/category-icons';
import type { TransactionWithCategory } from '../../types';

interface TransactionItemProps {
  transaction: TransactionWithCategory;
  onPress: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const TransactionItem = memo(function TransactionItem({
  transaction,
  onPress,
  onLongPress,
  style,
  testID,
}: TransactionItemProps) {
  const colors = useTheme();
  const isExpense = transaction.type === 'expense';
  const pressScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const handlePressIn = () => {
    pressScale.value = withSpring(0.985, { damping: 18, stiffness: 260 });
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, { damping: 18, stiffness: 260 });
  };

  const amountColor = isExpense ? colors.error : colors.success;
  const amountPrefix = isExpense ? '-' : '+';
  const category = transaction.category;
  const Icon = getCategoryIcon(category?.icon);

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={onLongPress}
        style={[styles.container, style]}
        accessibilityRole="button"
        accessibilityLabel={`${category?.name ?? 'Transaction'}, ${amountPrefix}${formatCurrency(transaction.amount, { showSign: false })}, ${formatDate(transaction.date)}`}
        testID={testID}
        android_ripple={{ color: colors.primary + '14' }}
      >
        <View
          style={[
            styles.iconBadge,
            { backgroundColor: (category?.color ?? colors.primary) + '1F' },
          ]}
        >
          <Icon size={22} strokeWidth={2.2} color={category?.color ?? colors.primary} />
        </View>

        <View style={styles.details}>
          <ThemedText variant="body" weight="semibold" color="primary" numberOfLines={1}>
            {category?.name || 'Sans catégorie'}
          </ThemedText>
          <View style={styles.meta}>
            <ThemedText variant="caption" color="tertiary" style={styles.dateText}>
              {formatDate(transaction.date)}
            </ThemedText>
            {transaction.note ? (
              <>
                <ThemedText variant="caption" color="tertiary" style={styles.dot}>•</ThemedText>
                <ThemedText variant="caption" color="tertiary" numberOfLines={1} style={styles.note}>
                  {transaction.note}
                </ThemedText>
              </>
            ) : null}
          </View>
        </View>

        <ThemedText
          variant="body"
          weight="bold"
          style={[styles.amount, { color: amountColor }]}
        >
          {amountPrefix}{formatCurrency(transaction.amount, { showSign: false })}
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  iconBadge: {
    width: 46,
    height: 46,
    borderRadius: borderRadius.lg - 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dateText: {
    fontVariant: ['tabular-nums'],
  },
  dot: {
    opacity: 0.5,
  },
  note: {
    flexShrink: 1,
  },
  amount: {
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
    fontSize: typography.fontSize.md,
  },
});

export default TransactionItem;
