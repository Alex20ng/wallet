import "../global.css";

import { Providers } from "@/components/providers";
import { PublicHead } from "@/components/seo/public-head";
import { AnimatedSplash } from "@/components/splash/AnimatedSplash";
import { ThemedView } from "@/components/ui/themed-view";
import VercelAnalytics from "@/components/VercelAnalytics";
import { loadThemePreference } from "@/hooks/theme-preference";
import { runMigrations } from "@/services/database";
import { NotificationService } from "@/services/notifications/NotificationService";
import { notificationPreferences } from "@/storage/notificationPreferences";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 400, fade: true });

// Pages publiques statiques : elles ne dépendent pas de la base locale et
// peuvent être pré-rendues côté serveur (SEO) sans attendre les migrations.
const isPublicRoute = (pathname: string) =>
  pathname === "/docs" || pathname.startsWith("/legal/");

// Pages indexables par les moteurs de recherche. La racine "/" correspond à
// l'application (données privées) : seule la présentation et les pages
// légales sont exposées à l'indexation.
const isIndexableRoute = (pathname: string) =>
  pathname === "/docs" || pathname.startsWith("/legal/");

export default function RootLayout() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  const renderNavigator =
    ready || (Platform.OS === "web" && isPublicRoute(pathname));

  const handleSplashFinish = useCallback(() => setSplashDone(true), []);

  useEffect(() => {
    (async () => {
      try {
        // Sur web, runMigrations() renvoie une promesse (chargement IndexedDB) :
        // on doit l'attendre avant de monter la navigation, sinon les premières
        // requêtes échouent avec "Base web non initialisée".
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
      }
    })();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaProvider>
          <Providers>
            <ThemedView style={{ flex: 1 }}>
              {!isIndexableRoute(pathname) ? (
                <PublicHead
                  title="Wallet — Gestion de budget et de dépenses personnelles"
                  description="Suivez vos dépenses, vos revenus et vos budgets. 100 % hors ligne, sans compte, vos données restent sur votre appareil."
                  path="/"
                  robots="noindex,nofollow"
                />
              ) : null}
              {renderNavigator ? (
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
                </Stack>
              ) : null}
              <VercelAnalytics />
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
