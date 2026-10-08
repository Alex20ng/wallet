import { useColorScheme } from "@/hooks/use-color-scheme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "expo-router";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const fonts = {
  regular: { fontFamily: "System", fontWeight: "400" },
  medium: { fontFamily: "System", fontWeight: "500" },
  bold: { fontFamily: "System", fontWeight: "700" },
  heavy: { fontFamily: "System", fontWeight: "900" },
} as const;

const DarkTheme = {
  dark: true,
  fonts,
  colors: {
    primary: "#34D399",
    background: "#0F172A",
    card: "#1E293B",
    text: "#F8FAFC",
    border: "rgba(255, 255, 255, 0.10)",
    notification: "#F43F5E",
  },
};

const DefaultTheme = {
  dark: false,
  fonts,
  colors: {
    primary: "#10B981",
    background: "#F8FAFC",
    card: "#FFFFFF",
    text: "#0F172A",
    border: "#E2E8F0",
    notification: "#F43F5E",
  },
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
