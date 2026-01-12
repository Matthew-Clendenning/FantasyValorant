import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Text, View } from "react-native";
import "react-native-reanimated";

import { AuthProvider } from "../src/contexts/AuthContext";
import { QueryProvider } from "../src/contexts/QueryProvider";
import { ErrorBoundary } from "../src/components";

// Prevent splash screen from auto-hiding until fonts are loaded
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Valorant: require("../assets/fonts/Valorant Font.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0F1923" }}>
        <Text style={{ color: "#ECE8E1" }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryProvider>
          <ThemeProvider value={DefaultTheme}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="league" options={{ headerShown: false }} />
              <Stack.Screen
                name="settings"
                options={{
                  presentation: "transparentModal",
                  headerShown: false,
                  animation: "none",
                }}
              />
              <Stack.Screen
                name="create-league"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="join-league"
                options={{ headerShown: false }}
              />
            </Stack>
            <StatusBar style="light" />
          </ThemeProvider>
        </QueryProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}