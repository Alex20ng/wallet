import React, { ComponentRef, forwardRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import {
  borderRadius,
  gradients,
  shadows,
  spacing,
  typography,
} from "../../constants/theme";
import { useTheme } from "../../hooks/use-theme";
import { ThemedText } from "./themed-text";

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

const Button = forwardRef<ComponentRef<typeof Pressable>, ButtonProps>(
  (
    {
      title,
      onPress,
      variant = "primary",
      size = "md",
      disabled = false,
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      accessibilityLabel,
      testID,
      style,
    },
    ref,
  ) => {
    const colors = useTheme();
    const scale = useSharedValue(1);

    const sizeStyles = {
      sm: {
        paddingVertical: spacing.xs + 2,
        paddingHorizontal: spacing.md,
        fontSize: typography.fontSize.sm,
        gap: spacing.xs,
        radius: borderRadius.md,
      },
      md: {
        paddingVertical: spacing.sm + 2,
        paddingHorizontal: spacing.lg,
        fontSize: typography.fontSize.md,
        gap: spacing.sm,
        radius: borderRadius.md + 2,
      },
      lg: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        fontSize: typography.fontSize.lg,
        gap: spacing.md,
        radius: borderRadius.lg,
      },
    };

    const isGradient = variant === "primary" || variant === "danger";
    const gradientColors =
      variant === "danger" ? gradients.danger : gradients.brand;

    const solidColors = {
      primary: { bg: colors.primary, text: colors.textInverse, border: colors.primary },
      secondary: { bg: colors.surface, text: colors.textPrimary, border: colors.border },
      outline: { bg: "transparent", text: colors.primary, border: colors.primary },
      ghost: { bg: "transparent", text: colors.textSecondary, border: "transparent" },
      danger: { bg: colors.error, text: colors.textInverse, border: colors.error },
    };

    const vColors = solidColors[variant];
    const sStyles = sizeStyles[size];

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
      if (!disabled && !loading) {
        scale.value = withSpring(0.96, { damping: 15, stiffness: 220 });
      }
    };

    const handlePressOut = () => {
      if (!disabled && !loading) {
        scale.value = withSpring(1, { damping: 15, stiffness: 220 });
      }
    };

    const handlePress = () => {
      if (!disabled && !loading) {
        onPress();
      }
    };

    const background = disabled ? (
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: colors.backgroundTertiary, borderRadius: sStyles.radius },
        ]}
      />
    ) : isGradient ? (
      <LinearGradient
        colors={[...gradientColors]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: sStyles.radius }]}
      />
    ) : (
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: vColors.bg, borderRadius: sStyles.radius },
        ]}
      />
    );

    const textColor = disabled
      ? colors.textTertiary
      : variant === "outline" || variant === "ghost"
        ? colors.primary
        : colors.textInverse;

    return (
      <Animated.View
        style={[
          styles.animatedContainer,
          animatedStyle,
          fullWidth && styles.fullWidth,
        ]}
      >
        <Pressable
          ref={ref}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel || title}
          accessibilityState={{
            disabled: disabled || loading,
            busy: loading,
          }}
          style={[
            styles.container,
            {
              borderColor: vColors.border,
              borderRadius: sStyles.radius,
              ...sStyles,
            },
            variant === "primary" && !disabled && styles.primaryShadow,
            fullWidth && styles.fullWidth,
            style,
          ]}
          testID={testID}
          android_ripple={{ color: "#FFFFFF33" }}
        >
          {background}
          {loading ? (
            <View style={styles.spinnerContainer}>
              <ActivityIndicator color={textColor} size="small" />
            </View>
          ) : (
            <View style={[styles.content, { gap: sStyles.gap }]}>
              {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
              <ThemedText
                variant="body"
                weight="semibold"
                color={variant === "ghost" ? "secondary" : "primary"}
                style={{
                  fontSize: sStyles.fontSize,
                  color: textColor,
                }}
              >
                {title}
              </ThemedText>
              {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
            </View>
          )}
        </Pressable>
      </Animated.View>
    );
  },
);

Button.displayName = "Button";

const styles = StyleSheet.create({
  animatedContainer: {
    alignSelf: "stretch",
  },

  fullWidth: {
    width: "100%",
  },

  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    overflow: "hidden",
  },

  primaryShadow: {
    ...shadows.sm,
    shadowColor: "#10B981",
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  icon: {
    flexShrink: 0,
  },

  spinnerContainer: {
    paddingVertical: 2,
  },
});

export default Button;
