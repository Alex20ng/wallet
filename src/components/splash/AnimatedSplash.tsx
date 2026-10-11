import { useTheme } from "@/hooks/use-theme";
import { Image } from "expo-image";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, StyleSheet } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const splashLogo = require("../../../assets/images/splash-icon.png");

const FADE_DURATION_MS = 700;
const REDUCED_MOTION_FADE_MS = 200;
const MIN_VISIBLE_MS = 900;
const MAX_VISIBLE_MS = 5000;

type AnimatedSplashProps = {
  isReady: boolean;
  onFinish: () => void;
};

export function AnimatedSplash({ isReady, onFinish }: AnimatedSplashProps) {
  const { background } = useTheme();
  const opacity = useSharedValue(1);
  const startedRef = useRef(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [minElapsed, setMinElapsed] = useState(false);
  const [maxElapsed, setMaxElapsed] = useState(false);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (mounted) setReduceMotion(value);
      })
      .catch(() => {});

    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (value) => setReduceMotion(value),
    );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const minTimer = setTimeout(() => setMinElapsed(true), MIN_VISIBLE_MS);
    const maxTimer = setTimeout(() => setMaxElapsed(true), MAX_VISIBLE_MS);
    return () => {
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
    };
  }, []);

  useEffect(() => {
    if (startedRef.current || !minElapsed || (!isReady && !maxElapsed)) {
      return;
    }
    startedRef.current = true;

    opacity.value = withTiming(
      0,
      {
        duration: reduceMotion ? REDUCED_MOTION_FADE_MS : FADE_DURATION_MS,
        easing: Easing.out(Easing.ease),
      },
      (finished) => {
        if (finished) runOnJS(onFinish)();
      },
    );
  }, [isReady, minElapsed, maxElapsed, reduceMotion, onFinish, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[styles.container, { backgroundColor: background }, animatedStyle]}
    >
      <Image source={splashLogo} style={styles.logo} contentFit="contain" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  logo: {
    width: 200,
    height: 200,
  },
});

export default AnimatedSplash;
