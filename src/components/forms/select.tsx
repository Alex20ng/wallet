import React, { forwardRef, ComponentRef } from 'react';
import { View, StyleSheet, Pressable, StyleProp, ViewStyle } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../hooks/use-theme';
import { spacing, borderRadius, animation } from '../../constants/theme';
import { ThemedText, Modal } from '../ui';

import Input from '../ui/input';

interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  color?: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  searchable?: boolean;
  testID?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const Select = forwardRef<ComponentRef<typeof Pressable>, SelectProps>(
  ({
    value,
    onChange,
    options,
    placeholder = 'Sélectionner',
    label,
    error,
    disabled = false,
    required = false,
    searchable = false,
    testID,
    accessibilityLabel,
    style,
  }, ref) => {
    const colors = useTheme();
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchText, setSearchText] = React.useState('');
    const scale = useSharedValue(1);

    const filteredOptions = searchable && searchText
      ? options.filter(opt => opt.label.toLowerCase().includes(searchText.toLowerCase()))
      : options;

    const selectedOption = options.find(opt => opt.value === value);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
      if (!disabled) {
        scale.value = withTiming(0.98, { duration: animation.duration.fast });
      }
    };

    const handlePressOut = () => {
      if (!disabled) {
        scale.value = withTiming(1, { duration: animation.duration.fast });
      }
    };

    const handlePress = () => {
      if (!disabled) {
        setIsOpen(true);
      }
    };

    const handleSelect = (optionValue: string) => {
      onChange(optionValue);
      setIsOpen(false);
      setSearchText('');
    };

    return (
      <View style={style}>
        {label && (
          <ThemedText variant="caption" weight="medium" color="secondary" style={styles.label}>
            {label} {required && <ThemedText color="error">*</ThemedText>}
          </ThemedText>
        )}
        <Animated.View style={animatedStyle}>
          <Pressable
            ref={ref}
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel || label}
            accessibilityState={{ disabled }}
            accessibilityHint={error}
            style={[
              styles.select,
              {
                borderColor: error ? colors.error : isOpen ? colors.borderFocus : colors.borderStrong,
                borderWidth: isOpen || error ? 2 : 1,
                backgroundColor: disabled ? colors.backgroundTertiary : colors.surface,
              },
            ]}
            testID={testID}
          >
            <View style={styles.selectContent}>
              <ThemedText
                variant="body"
                color={value ? 'primary' : 'tertiary'}
                style={styles.selectText}
                numberOfLines={1}
              >
                {value ? selectedOption?.label : placeholder}
              </ThemedText>
              <View style={styles.chevron}>
                <ChevronDown
                  size={18}
                  strokeWidth={2.4}
                  color={colors.textTertiary}
                  style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
                />
              </View>
            </View>
          </Pressable>
        </Animated.View>
        {error && (
          <ThemedText variant="caption" color="error" style={styles.errorText} accessibilityLiveRegion="polite">
            {error}
          </ThemedText>
        )}

        <Modal
          visible={isOpen}
          onClose={() => setIsOpen(false)}
          size="full"
          showHandle={true}
          title={label}
        >
          {searchable && (
            <Input
              placeholder="Rechercher..."
              value={searchText}
              onChangeText={setSearchText}
              style={styles.searchInput}
              autoCapitalize="none"
            />
          )}
          <View style={styles.optionsContent}>
            {filteredOptions.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => handleSelect(option.value)}
                style={[styles.option, value === option.value && { backgroundColor: colors.primaryLight }]}
                accessibilityRole="button"
                accessibilityState={{ selected: value === option.value }}
                android_ripple={{ color: colors.primary + '33' }}
              >
                <View style={styles.optionContent}>
                  {option.icon && <View style={styles.optionIcon}>{option.icon}</View>}
                  {option.color && <View style={[styles.optionColor, { backgroundColor: option.color }]} />}
                  <ThemedText
                    variant="body"
                    color={value === option.value ? 'link' : 'primary'}
                    weight={value === option.value ? 'semibold' : 'regular'}
                  >
                    {option.label}
                  </ThemedText>
                </View>
                {value === option.value && (
                  <Check size={20} strokeWidth={2.6} color={colors.primary} />
                )}
              </Pressable>
            ))}
            {filteredOptions.length === 0 && (
              <ThemedText variant="body" color="tertiary" style={styles.noResults}>
                Aucun résultat
              </ThemedText>
            )}
          </View>
        </Modal>
      </View>
    );
  }
);

Select.displayName = 'Select';

const styles = StyleSheet.create({
  label: {
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  selectContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    flex: 1,
  },
  chevron: {
    marginLeft: spacing.md,
    flexShrink: 0,
  },
  errorText: {
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  searchInput: {
    marginBottom: spacing.sm,
  },
  optionsContent: {
    gap: spacing.xs,
    paddingBottom: spacing.lg,
  },
  option: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  optionIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.xs,
  },
  noResults: {
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});

export default Select;