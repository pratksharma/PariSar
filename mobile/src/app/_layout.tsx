import { useEffect, useState, type JSX } from "react";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { HeroUINativeConfig, HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Uniwind } from "uniwind";

import {
  useFonts,
  SourceSerif4_500Medium,
  SourceSerif4_500Medium_Italic,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from "@expo-google-fonts/dev";

import "../global.css";
import { usePreferencesStore } from "@/stores/preferences.store";

const config: HeroUINativeConfig = {
  devInfo: {
    stylingPrinciples: false,
  },
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout(): JSX.Element {
  const [loaded, error] = useFonts({
    SourceSerif4_500Medium,
    SourceSerif4_500Medium_Italic,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      void SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  const hydrate = usePreferencesStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, []);

  const theme = usePreferencesStore((state) => state.preferences.theme);

  useEffect(() => {
    if (!theme) return;

    Uniwind.setTheme(theme ?? "system");
  }, [theme]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider config={config}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="onboarding" options={{ title: "Onboarding" }} />

          <Stack.Screen name="index" options={{ title: "Home" }} />
        </Stack>
        <StatusBar style="auto" />
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
