import { Providers } from "@/components/providers";
import { runMigrations } from "@/database/connection";
import { loadThemePreference } from "@/hooks/theme-preference";
import { useColorScheme } from "@/hooks/use-color-scheme";
import NotificationService from "@/services/notifications/NotificationService";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";

// Hide splash screen after initialization
SplashScreen.preventAutoHideAsync();
NotificationService.configure();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [databaseReady, setDatabaseReady] = useState(false);

  useEffect(() => {
    // Run database migrations on app start
    const runDbMigrations = async () => {
      try {
        runMigrations();
        setDatabaseReady(true);
        SplashScreen.hideAsync();
      } catch (error) {
        console.error("Failed to run migrations:", error);
        SplashScreen.hideAsync();
      }
    };
    runDbMigrations();
  }, []);

  useEffect(() => {
    loadThemePreference();
  }, []);

  if (!databaseReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Providers>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: colorScheme === "dark" ? "#0F172A" : "#F8FAFC",
              },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="transaction/new"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="transaction/[id]"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="+not-found" options={{ headerShown: false }} />
            <Stack.Screen
              name="category-form"
              options={{
                presentation: "formSheet",
                headerShown: false,
                sheetGrabberVisible: true,
                sheetAllowedDetents: [0.7, 1],
                sheetCornerRadius: 28,
                contentStyle: { backgroundColor: "transparent" }, // Liquid Glass iOS 26
              }}
            />
          </Stack>
        </Providers>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
