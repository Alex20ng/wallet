import React, { forwardRef, useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, TextInput, StyleProp, ViewStyle } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../hooks/use-theme';
import { spacing, borderRadius, typography } from '../../constants/theme';
import { ThemedText } from '../ui';
import { formatCurrency, parseCurrency, CURRENCY_CODE } from '../../services/currency';

interface NumberInputProps {
  value: number; // in cents
  onChange: (value: number) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  showCurrency?: boolean;
  currency?: string;
  testID?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const NumberInput = forwardRef<TextInput, NumberInputProps>(
  ({
    value,
    onChange,
    label,
    placeholder = '0,00',
    error,
    disabled = false,
    required = false,
    min = 0,
    max = 999999999,
    step = 100,
    showCurrency = true,
    currency = CURRENCY_CODE,
    testID,
    accessibilityLabel,
    style,
  }, ref) => {
    const themeColors = useTheme();
    const [inputValue, setInputValue] = useState(formatCurrency(value, { showSign: false }));
    const [isFocused, setIsFocused] = useState(false);
    const scale = useSharedValue(1);

    const formattedValue = formatCurrency(value, { showSign: false });
    const displayValue = isFocused ? inputValue : formattedValue;

    useEffect(() => {
      if (!isFocused) {
        setInputValue(formattedValue);
      }
    }, [value, formattedValue, isFocused]);

    const handleChangeText = (text: string) => {
      if (text === '') {
        setInputValue('');
        onChange(0);
        return;
      }

      const cleaned = text.replace(/[^\d.,-]/g, '').replace(',', '.');
      setInputValue(cleaned);

      const parsed = parseCurrency(cleaned);
      if (!Number.isNaN(parsed)) {
        const clamped = Math.max(min, Math.min(max, parsed));
        onChange(clamped);
      }
    };

    const handleBlur = () => {
      setIsFocused(false);
      const parsed = inputValue === '' ? 0 : parseCurrency(inputValue);
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange(clamped);
      setInputValue(formatCurrency(clamped, { showSign: false }));
    };

    const handleFocus = () => {
      setIsFocused(true);
      setInputValue(value === 0 ? '' : String(value / 100));
    };

    const increment = () => {
      const newValue = Math.min(max, value + step);
      onChange(newValue);
      setInputValue(formatCurrency(newValue, { showSign: false }));
    };

    const decrement = () => {
      const newValue = Math.max(min, value - step);
      onChange(newValue);
      setInputValue(formatCurrency(newValue, { showSign: false }));
    };

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
      if (!disabled) {
        scale.value = withSpring(0.98, { damping: 15, stiffness: 220 });
      }
    };

    const handlePressOut = () => {
      if (!disabled) {
        scale.value = withSpring(1, { damping: 15, stiffness: 220 });
      }
    };

    const borderColor = error
      ? themeColors.error
      : isFocused
        ? themeColors.borderFocus
        : themeColors.border;

    return (
      <View style={style}>
        {label && (
          <ThemedText variant="caption" weight="medium" color="secondary" style={styles.label}>
            {label} {required && <ThemedText color="error">*</ThemedText>}
          </ThemedText>
        )}
        <Animated.View style={animatedStyle}>
          <View
            style={[
              styles.inputWrapper,
              {
                borderColor,
                borderWidth: isFocused || error ? 1.5 : 1,
                backgroundColor: disabled ? themeColors.backgroundSecondary : themeColors.surface,
              },
            ]}
          >
            <View style={styles.amountRow}>
              {showCurrency && (
                <ThemedText variant="caption" weight="bold" color="tertiary" style={styles.currencySymbol}>
                  {currency}
                </ThemedText>
              )}
              <TextInput
                ref={ref}
                value={displayValue}
                onChangeText={handleChangeText}
                onFocus={handleFocus}
                onBlur={handleBlur}
                editable={!disabled}
                keyboardType="decimal-pad"
                autoComplete="off"
                spellCheck={false}
                placeholder={placeholder}
                placeholderTextColor={themeColors.textTertiary}
                style={[
                  styles.input,
                  {
                    color: disabled ? themeColors.textTertiary : themeColors.textPrimary,
                    fontSize: typography.fontSize.xxl,
                  },
                ]}
                accessibilityLabel={accessibilityLabel || label}
                accessibilityState={{ disabled }}
                accessibilityValue={{ text: formattedValue }}
                testID={testID}
              />
            </View>
            {!disabled && (
              <View style={[styles.stepper, { borderLeftColor: themeColors.border }]}>
                <Pressable
                  onPress={decrement}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  disabled={value <= min}
                  accessibilityLabel="Diminuer"
                  accessibilityRole="button"
                  style={[
                    styles.stepperButton,
                    { backgroundColor: themeColors.backgroundSecondary },
                    value <= min && styles.stepperButtonDisabled,
                  ]}
                  hitSlop={4}
                >
                  <Minus size={18} strokeWidth={2.6} color={value <= min ? themeColors.textTertiary : themeColors.textPrimary} />
                </Pressable>
                <Pressable
                  onPress={increment}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  disabled={value >= max}
                  accessibilityLabel="Augmenter"
                  accessibilityRole="button"
                  style={[
                    styles.stepperButton,
                    { backgroundColor: themeColors.backgroundSecondary },
                    value >= max && styles.stepperButtonDisabled,
                  ]}
                  hitSlop={4}
                >
                  <Plus size={18} strokeWidth={2.6} color={value >= max ? themeColors.textTertiary : themeColors.textPrimary} />
                </Pressable>
              </View>
            )}
          </View>
        </Animated.View>
        {error && (
          <ThemedText variant="caption" color="error" style={styles.errorText} accessibilityLiveRegion="polite">
            {error}
          </ThemedText>
        )}
      </View>
    );
  }
);

NumberInput.displayName = 'NumberInput';

const styles = StyleSheet.create({
  label: {
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 62,
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
    borderRadius: borderRadius.md + 2,
    borderWidth: 1,
  },
  amountRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  currencySymbol: {
    fontSize: typography.fontSize.sm,
    letterSpacing: 0.5,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingRight: spacing.sm,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  stepper: {
    flexDirection: 'row',
    borderLeftWidth: 1,
    gap: spacing.xs,
    paddingLeft: spacing.sm,
  },
  stepperButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperButtonDisabled: {
    opacity: 0.35,
  },
  errorText: {
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});

export default NumberInput;
