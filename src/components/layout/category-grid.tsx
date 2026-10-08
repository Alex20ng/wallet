import React, { memo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import { ThemedText } from '../ui';
import { useTheme } from '../../hooks/use-theme';
import { spacing, borderRadius, shadows } from '../../constants/theme';
import { getCategoryIcon } from '../../constants/category-icons';
import type { Category } from '../../types';

interface CategoryItemProps {
  category: Category;
  isSelected: boolean;
  onPress: () => void;
}

const CategoryItem = memo(function CategoryItem({ category, isSelected, onPress }: CategoryItemProps) {
  const colors = useTheme();
  const pressScale = useSharedValue(1);
  const Icon = getCategoryIcon(category.icon);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const handlePressIn = () => {
    pressScale.value = withSpring(0.94, { damping: 15, stiffness: 260 });
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, { damping: 15, stiffness: 260 });
  };

  return (
    <Animated.View style={[styles.item, animatedStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.itemContent,
          { backgroundColor: colors.surface, borderColor: colors.border },
          isSelected && { borderColor: category.color, backgroundColor: category.color + '0F' },
        ]}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
        accessibilityLabel={category.name}
        android_ripple={{ color: category.color + '26' }}
      >
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: isSelected ? category.color : category.color + '1A' },
          ]}
        >
          <Icon
            size={22}
            strokeWidth={2.2}
            color={isSelected ? '#FFFFFF' : category.color}
          />
        </View>
        <ThemedText
          variant="caption"
          weight={isSelected ? 'bold' : 'medium'}
          color={isSelected ? 'primary' : 'secondary'}
          numberOfLines={2}
          style={styles.name}
        >
          {category.name}
        </ThemedText>
        {isSelected && (
          <View style={[styles.checkmark, { backgroundColor: category.color }]}>
            <Check size={10} strokeWidth={3.5} color="#FFFFFF" />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
});

export const CategoryGrid = memo(function CategoryGrid({
  categories,
  selectedIds,
  onSelect,
  multiple = false,
  columns = 4,
  testID,
}: {
  categories: Category[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  multiple?: boolean;
  columns?: number;
  testID?: string;
}) {
  void multiple;

  return (
    <View style={styles.container} testID={testID}>
      {categories.map((category) => (
        <View key={category.id} style={{ width: `${100 / columns}%`, padding: spacing.xs }}>
          <CategoryItem
            category={category}
            isSelected={selectedIds.includes(category.id)}
            onPress={() => onSelect(category.id)}
          />
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  item: {
    width: '100%',
  },
  itemContent: {
    aspectRatio: 1,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    ...shadows.xs,
    shadowOpacity: 0.04,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CategoryGrid;
