import React, { forwardRef } from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  KeyboardTypeOptions,
} from 'react-native';
import { useTheme } from '../../hooks/use-theme';
import { spacing, borderRadius, typography, shadows } from '../../constants/theme';
import { ThemedText } from './themed-text';

export interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  type?: 'text' | 'email' | 'password' | 'number' | 'decimal-pad' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: 'off' | 'email' | 'name' | 'tel' | 'password' | 'current-password' | 'new-password' | 'cc-number';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onFocus?: () => void;
  onBlur?: () => void;
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  testID?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const KEYBOARD_TYPES: Record<NonNullable<InputProps['type']>, KeyboardTypeOptions> = {
  text: 'default',
  email: 'email-address',
  password: 'default',
  number: 'number-pad',
  'decimal-pad': 'decimal-pad',
  'phone-pad': 'phone-pad',
};

const Input = forwardRef<TextInput, InputProps>(
  ({
    value,
    onChangeText,
    placeholder,
    label,
    error,
    helperText,
    disabled = false,
    required = false,
    type = 'text',
    autoCapitalize = 'sentences',
    autoComplete = 'off',
    leftIcon,
    rightIcon,
    onFocus,
    onBlur,
    maxLength,
    multiline = false,
    numberOfLines,
    testID,
    accessibilityLabel,
    style,
  }, ref) => {
    const themeColors = useTheme();
    const [isFocused, setIsFocused] = React.useState(false);
    const hasError = Boolean(error);

    const borderColor = hasError
      ? themeColors.error
      : isFocused
        ? themeColors.borderFocus
        : themeColors.border;

    const handleFocus = () => {
      setIsFocused(true);
      onFocus?.();
    };

    const handleBlur = () => {
      setIsFocused(false);
      onBlur?.();
    };

    return (
      <View style={[styles.container, style]}>
        {label && (
          <ThemedText variant="caption" weight="medium" color="secondary" style={styles.label}>
            {label} {required && <ThemedText color="error">*</ThemedText>}
          </ThemedText>
        )}
        <View
          style={[
            styles.inputWrapper,
            {
              borderColor,
              borderWidth: isFocused || hasError ? 1.5 : 1,
              backgroundColor: disabled ? themeColors.backgroundSecondary : themeColors.surface,
            },
            isFocused && !hasError && styles.focused,
          ]}
        >
          {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
          <TextInput
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={themeColors.textTertiary}
            editable={!disabled}
            autoCapitalize={autoCapitalize}
            autoComplete={autoComplete}
            keyboardType={KEYBOARD_TYPES[type]}
            secureTextEntry={type === 'password'}
            multiline={multiline}
            numberOfLines={numberOfLines}
            maxLength={maxLength}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={[
              styles.input,
              multiline && styles.inputMultiline,
              {
                color: themeColors.textPrimary,
                fontSize: typography.fontSize.md,
              },
            ]}
            accessibilityLabel={accessibilityLabel || label}
            accessibilityState={{ disabled }}
            accessibilityHint={error}
            testID={testID}
          />
          {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
        </View>
        {error && (
          <ThemedText variant="caption" color="error" style={styles.helperText} accessibilityLiveRegion="polite">
            {error}
          </ThemedText>
        )}
        {!error && helperText && (
          <ThemedText variant="caption" color="tertiary" style={styles.helperText}>
            {helperText}
          </ThemedText>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    marginLeft: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md + 2,
    minHeight: 50,
    ...shadows.xs,
    shadowOpacity: 0.03,
  },
  focused: {
    shadowColor: '#10B981',
    shadowOpacity: 0.12,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
  },
  inputMultiline: {
    minHeight: 96,
    textAlignVertical: 'top',
    paddingTop: spacing.sm + 2,
  },
  icon: {
    paddingHorizontal: spacing.md,
  },
  helperText: {
    marginLeft: spacing.xs,
  },
});

export default Input;
