import "../global.css";

import { Providers } from "@/components/providers";
import { AnimatedSplash } from "@/components/splash/AnimatedSplash";
import { ThemedView } from "@/components/ui/themed-view";
import VercelAnalytics from "@/components/VercelAnalytics";
import { loadThemePreference } from "@/hooks/theme-preference";
import { runMigrations } from "@/services/database";
import { NotificationService } from "@/services/notifications/NotificationService";
import { notificationPreferences } from "@/storage/notificationPreferences";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 400, fade: true });

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  const handleSplashFinish = useCallback(() => setSplashDone(true), []);

  useEffect(() => {
    (async () => {
      try {
        await runMigrations();
        await loadThemePreference();
        await NotificationService.configure();
        const prefs = await notificationPreferences.getPreferences();
        if (prefs.notificationsEnabled) {
          await NotificationService.requestPermissions();
          if (prefs.dailyReminderEnabled) {
            await NotificationService.scheduleDailyReminder(
              prefs.dailyReminderHour,
              prefs.dailyReminderMinute,
            );
          }
        }
      } catch (e) {
        console.error("[RootLayout]", e);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaProvider>
          <Providers>
            <ThemedView style={{ flex: 1 }}>
              {ready ? (
                <Stack
                  screenOptions={{
                    headerShown: false,
                    animation: "slide_from_right",
                    contentStyle: { backgroundColor: "transparent" },
                  }}
                >
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="transaction/[id]"
                    options={{
                      presentation: "modal",
                      animation: "slide_from_bottom",
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="transaction/new"
                    options={{
                      presentation: "modal",
                      animation: "slide_from_bottom",
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="category-form"
                    options={{
                      presentation: "formSheet",
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="legal/terms"
                    options={{
                      presentation: "modal",
                      animation: "slide_from_bottom",
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="legal/privacy"
                    options={{
                      presentation: "modal",
                      animation: "slide_from_bottom",
                      headerShown: false,
                    }}
                  />
                  <VercelAnalytics />
                </Stack>
              ) : null}
              <StatusBar style="auto" />
            </ThemedView>
          </Providers>
        </SafeAreaProvider>
      </BottomSheetModalProvider>
      {!splashDone ? (
        <AnimatedSplash isReady={ready} onFinish={handleSplashFinish} />
      ) : null}
    </GestureHandlerRootView>
  );
}
