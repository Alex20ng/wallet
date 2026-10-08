import React, { forwardRef } from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/use-theme';
import { typography } from '../../constants/theme';

interface ThemedTextProps extends TextProps {
  variant?: 'display' | 'headline' | 'title' | 'subtitle' | 'body' | 'caption' | 'overline';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'success' | 'warning' | 'error' | 'link';
}

export const ThemedText = forwardRef<Text, ThemedTextProps>(
  ({ variant = 'body', weight = 'regular', color = 'primary', style, children, ...props }, ref) => {
    const colors = useTheme();

    const colorMap = {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
      tertiary: colors.textTertiary,
      inverse: colors.textInverse,
      success: colors.success,
      warning: colors.warning,
      error: colors.error,
      link: colors.textLink,
    };

    const variantStyles = {
      display: {
        fontSize: typography.fontSize.display,
        lineHeight: typography.fontSize.display * typography.lineHeight.tight,
        letterSpacing: -1,
      },
      headline: {
        fontSize: typography.fontSize.xxxl,
        lineHeight: typography.fontSize.xxxl * typography.lineHeight.tight,
        letterSpacing: -0.6,
      },
      title: {
        fontSize: typography.fontSize.xxl,
        lineHeight: typography.fontSize.xxl * typography.lineHeight.normal,
        letterSpacing: -0.4,
      },
      subtitle: {
        fontSize: typography.fontSize.lg,
        lineHeight: typography.fontSize.lg * typography.lineHeight.normal,
        letterSpacing: -0.2,
      },
      body: {
        fontSize: typography.fontSize.md,
        lineHeight: typography.fontSize.md * typography.lineHeight.normal,
      },
      caption: {
        fontSize: typography.fontSize.sm,
        lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
      },
      overline: {
        fontSize: typography.fontSize.xs,
        lineHeight: typography.fontSize.xs * typography.lineHeight.normal,
        textTransform: 'uppercase' as const,
        letterSpacing: 0.8,
        fontWeight: '600' as const,
      },
    };

    const weightStyles = {
      regular: { fontWeight: typography.fontWeight.regular },
      medium: { fontWeight: typography.fontWeight.medium },
      semibold: { fontWeight: typography.fontWeight.semibold },
      bold: { fontWeight: typography.fontWeight.bold },
    };

    return (
      <Text
        ref={ref}
        style={[
          styles.base,
          variantStyles[variant],
          weightStyles[weight],
          { color: colorMap[color] },
          style,
        ]}
        {...props}
      >
        {children}
      </Text>
    );
  }
);

ThemedText.displayName = 'ThemedText';

const styles = StyleSheet.create({
  base: {
    fontFamily: typography.fontFamily.regular,
  },
});

export default ThemedText;
