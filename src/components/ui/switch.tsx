import { ComponentRef, forwardRef, useEffect } from "react";
import { Pressable, StyleProp, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "../../hooks/use-theme";

export interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  testID?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const THUMB_TRAVEL = 20;

const Switch = forwardRef<ComponentRef<typeof Pressable>, SwitchProps>(
  (
    {
      value,
      onValueChange,
      disabled = false,
      testID,
      accessibilityLabel,
      style,
    },
    ref,
  ) => {
    const colors = useTheme();
    const progress = useSharedValue(value ? 1 : 0);

    useEffect(() => {
      progress.value = withSpring(value ? 1 : 0, {
        damping: 16,
        stiffness: 220,
      });
    }, [value, progress]);

    const animatedThumbStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: progress.value * THUMB_TRAVEL }],
    }));

    const animatedTrackStyle = useAnimatedStyle(() => ({
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        [colors.backgroundTertiary, colors.primary],
      ),
    }));

    const handlePress = () => {
      if (!disabled) {
        const newValue = !value;
        progress.value = withSpring(newValue ? 1 : 0, {
          damping: 16,
          stiffness: 220,
        });
        onValueChange(newValue);
      }
    };

    return (
      <Pressable
        ref={ref}
        onPress={handlePress}
        disabled={disabled}
        accessibilityRole="switch"
        accessibilityState={{ checked: value, disabled }}
        accessibilityLabel={accessibilityLabel}
        style={[styles.container, { opacity: disabled ? 0.5 : 1 }, style]}
        testID={testID}
        hitSlop={6}
      >
        <Animated.View style={[styles.track, animatedTrackStyle]}>
          <Animated.View style={[styles.thumb, animatedThumbStyle]} />
        </Animated.View>
      </Pressable>
    );
  },
);

Switch.displayName = "Switch";

const styles = StyleSheet.create({
  container: {
    width: 52,
    height: 32,
    justifyContent: "center",
  },
  track: {
    width: "100%",
    height: 32,
    borderRadius: 16,
    padding: 3,
    justifyContent: "center",
  },
  thumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default Switch;
