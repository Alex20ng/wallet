import { Providers } from "@/components/providers";
import { ThemedView } from "@/components/ui/themed-view";
import { runMigrations } from "@/database/connection";
import { loadThemePreference } from "@/hooks/theme-preference";
import { NotificationService } from "@/services/notifications/NotificationService";
import { notificationPreferences } from "@/storage/notificationPreferences";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        runMigrations();
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
        await SplashScreen.hideAsync();
      }
    })();
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaProvider>
          <Providers>
            <ThemedView style={{ flex: 1 }}>
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: "slide_from_right",
                  contentStyle: { backgroundColor: "transparent" },
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
              </Stack>
              <StatusBar style="auto" />
            </ThemedView>
          </Providers>
        </SafeAreaProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
