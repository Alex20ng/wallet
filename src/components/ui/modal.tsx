import { X } from "lucide-react-native";
import React, { useEffect } from "react";
import {
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Modal as RNModal,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  animation,
  borderRadius,
  shadows,
  spacing,
} from "../../constants/theme";
import { useTheme } from "../../hooks/use-theme";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: "sm" | "md" | "lg" | "full";
  closeOnOverlayPress?: boolean;
  showHandle?: boolean;
  testID?: string;
}

const maxWidths = {
  sm: 320,
  md: 400,
  lg: 560,
  full: 768,
};

function Modal({
  visible,
  onClose,
  children,
  title,
  size = "md",
  closeOnOverlayPress = true,
  showHandle = true,
  testID,
}: ModalProps) {
  const colors = useTheme();
  const overlayOpacity = useSharedValue(0);
  const translateY = useSharedValue(40);

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, {
        duration: animation.duration.normal,
        easing: Easing.out(Easing.cubic),
      });
      translateY.value = withTiming(0, {
        duration: animation.duration.normal,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      overlayOpacity.value = withTiming(0, {
        duration: animation.duration.fast,
      });
      translateY.value = withTiming(40, { duration: animation.duration.fast });
    }
  }, [visible, overlayOpacity, translateY]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (visible) {
          onClose();
          return true;
        }
        return false;
      },
    );
    return () => subscription.remove();
  }, [visible, onClose]);

  useEffect(() => {
    if (visible) {
      Keyboard.dismiss();
    }
  }, [visible]);

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible && overlayOpacity.value === 0) {
    return null;
  }

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      testID={testID}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Animated.View
          style={[styles.overlay, animatedOverlayStyle]}
          onStartShouldSetResponder={() => closeOnOverlayPress}
          onResponderRelease={closeOnOverlayPress ? onClose : undefined}
          accessibilityLiveRegion="polite"
        >
          <Animated.View style={[styles.container, animatedContainerStyle]}>
            <Pressable
              onPress={closeOnOverlayPress ? onClose : undefined}
              style={StyleSheet.absoluteFill}
              accessibilityLabel="Fermer"
            />
            <ThemedView
              variant="surface"
              style={[styles.modal, { maxWidth: maxWidths[size] }]}
            >
              {showHandle && (
                <View style={styles.handleContainer}>
                  <View
                    style={[
                      styles.handle,
                      { backgroundColor: colors.borderStrong },
                    ]}
                  />
                </View>
              )}
              {title && (
                <View style={styles.header}>
                  <ThemedText
                    variant="subtitle"
                    weight="bold"
                    style={styles.headerTitle}
                  >
                    {title}
                  </ThemedText>
                  <Pressable
                    onPress={onClose}
                    style={[
                      styles.closeButton,
                      { backgroundColor: colors.backgroundSecondary },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Fermer"
                    hitSlop={8}
                  >
                    <X
                      size={18}
                      strokeWidth={2.4}
                      color={colors.textSecondary}
                    />
                  </Pressable>
                </View>
              )}
              <ScrollView
                style={styles.contentScroll}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                bounces={false}
                overScrollMode="never"
              >
                {children}
              </ScrollView>
            </ThemedView>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(8, 11, 22, 0.55)",
    justifyContent: "flex-end",
  },
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modal: {
    width: "100%",
    maxHeight: "92%",
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    overflow: "hidden",
    ...shadows.lg,
    elevation: 24,
  },
  handleContainer: {
    alignItems: "center",
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  contentScroll: {
    width: "100%",
    flexShrink: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl + spacing.lg + (Platform.OS === "ios" ? 8 : 0),
  },
});

export default Modal;