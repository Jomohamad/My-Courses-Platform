import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { useFonts, Cairo_400Regular, Cairo_600SemiBold, Cairo_700Bold } from "@expo-google-fonts/cairo";
import { StatusBar } from "expo-status-bar";
import { seedSampleData, clearAllData } from "@/lib/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="course/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="lesson/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="quiz/[lessonId]" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
      <Stack.Screen name="game/[lessonId]" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
      <Stack.Screen name="add-course" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
      <Stack.Screen name="add-lesson" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
      <Stack.Screen name="add-question" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
      <Stack.Screen name="add-game" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Cairo_400Regular,
    Cairo_600SemiBold,
    Cairo_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      const initData = async () => {
        const seeded = await AsyncStorage.getItem('seeded_v2');
        if (!seeded) {
          await clearAllData();
          await seedSampleData();
          await AsyncStorage.setItem('seeded_v2', 'true');
        }
      };
      initData();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardProvider>
            <StatusBar style="light" />
            <RootLayoutNav />
          </KeyboardProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
