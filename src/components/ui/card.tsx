import React, { forwardRef } from 'react';
import { View, StyleSheet, Pressable, StyleProp, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../hooks/use-theme';
import { spacing, borderRadius, shadows } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const Card = forwardRef<View, CardProps>(
  ({ children, variant = 'default', padding = 'md', onPress, disabled = false, style, testID }, ref) => {
    const colors = useTheme();
    const scale = useSharedValue(1);

    const paddingValues = {
      none: 0,
      sm: spacing.sm,
      md: spacing.md,
      lg: spacing.lg,
    };

    const variantStyles = {
      default: {
        backgroundColor: colors.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        ...shadows.xs,
      },
      elevated: {
        backgroundColor: colors.surface,
        borderWidth: 0,
        ...shadows.md,
      },
      outlined: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.border,
      },
    };

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
      if (onPress && !disabled) {
        scale.value = withSpring(0.98, { damping: 15, stiffness: 220 });
      }
    };

    const handlePressOut = () => {
      if (onPress && !disabled) {
        scale.value = withSpring(1, { damping: 15, stiffness: 220 });
      }
    };

    const handlePress = () => {
      if (onPress && !disabled) {
        onPress();
      }
    };

    return (
      <Animated.View style={animatedStyle}>
        <Pressable
          ref={ref}
          onPress={onPress ? handlePress : undefined}
          onPressIn={onPress ? handlePressIn : undefined}
          onPressOut={onPress ? handlePressOut : undefined}
          disabled={disabled}
          accessibilityRole={onPress ? 'button' : undefined}
          accessibilityState={{ disabled }}
          style={[
            styles.container,
            variantStyles[variant],
            { padding: paddingValues[padding] },
            style,
          ]}
          testID={testID}
          android_ripple={onPress ? { color: colors.primary + '1A' } : undefined}
        >
          {children}
        </Pressable>
      </Animated.View>
    );
  }
);

Card.displayName = 'Card';

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
});

export default Card;
