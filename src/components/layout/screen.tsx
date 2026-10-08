import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  RefreshControlProps,
  StyleProp,
  ViewStyle,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { ThemedView, ThemedText } from '../ui';
import { useTheme } from '../../hooks/use-theme';
import { spacing, shadows } from '../../constants/theme';

interface ScreenProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scrollable?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  onRefresh?: () => void;
  showsVerticalScrollIndicator?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  safeAreaEdges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export function Screen({
  children,
  style,
  scrollable = true,
  refreshControl,
  onRefresh,
  showsVerticalScrollIndicator = false,
  contentContainerStyle,
  safeAreaEdges = ['top', 'bottom'],
}: ScreenProps) {
  const colors = useTheme();

  const content = (
    <ThemedView style={[styles.container, style]} variant="default">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scrollable ? (
          <ScrollView
            refreshControl={refreshControl}
            showsVerticalScrollIndicator={showsVerticalScrollIndicator}
            contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.scrollContent, contentContainerStyle]}>
            {children}
          </View>
        )}
      </KeyboardAvoidingView>
    </ThemedView>
  );

  if (safeAreaEdges.length === 0) {
    return content;
  }

  return (
    <SafeAreaView edges={safeAreaEdges} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {content}
    </SafeAreaView>
  );
}

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function ScreenHeader({ title, subtitle, leftAction, rightAction, style }: ScreenHeaderProps) {
  return (
    <View style={[styles.header, style]}>
      <View style={styles.headerSide}>{leftAction}</View>
      <View style={styles.headerCenter}>
        <ThemedText variant="subtitle" weight="bold" color="primary" numberOfLines={1}>
          {title}
        </ThemedText>
        {subtitle && (
          <ThemedText variant="caption" color="tertiary" style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </ThemedText>
        )}
      </View>
      <View style={[styles.headerSide, styles.headerSideRight]}>{rightAction}</View>
    </View>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function PageHeader({ title, subtitle, onBack, rightAction, style }: PageHeaderProps) {
  const colors = useTheme();

  return (
    <View style={[styles.pageHeader, style]}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          accessibilityRole="button"
          accessibilityLabel="Retour"
          hitSlop={8}
        >
          <ChevronLeft size={22} strokeWidth={2.4} color={colors.textPrimary} />
        </Pressable>
      ) : (
        <View style={styles.backButtonPlaceholder} />
      )}
      <View style={styles.pageHeaderCenter}>
        <ThemedText variant="subtitle" weight="bold" numberOfLines={1} style={styles.pageTitle}>
          {title}
        </ThemedText>
        {subtitle && (
          <ThemedText variant="caption" color="tertiary" numberOfLines={1}>
            {subtitle}
          </ThemedText>
        )}
      </View>
      <View style={styles.pageHeaderRight}>{rightAction}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl + spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    minHeight: 44,
  },
  headerSide: {
    minWidth: 44,
  },
  headerSideRight: {
    alignItems: 'flex-end',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  subtitle: {
    marginTop: 2,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.xs,
  },
  backButtonPlaceholder: {
    width: 40,
    height: 40,
  },
  pageHeaderCenter: {
    flex: 1,
    alignItems: 'center',
  },
  pageTitle: {
    textAlign: 'center',
  },
  pageHeaderRight: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
});

export default Screen;
