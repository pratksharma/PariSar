import { useEffect, type JSX } from "react";
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
import { useAuthStore } from "@/stores/authStore";

const config: HeroUINativeConfig = {
  devInfo: {
    stylingPrinciples: false,
  },
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout(): JSX.Element {
  const [fontsLoaded] = useFonts({
    SourceSerif4_500Medium,
    SourceSerif4_500Medium_Italic,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  const hydrate = usePreferencesStore((s) => s.hydrate);
  const theme = usePreferencesStore((s) => s.preferences.theme);
  const onboarded = usePreferencesStore((s) => s.preferences.onboarded);

  const initialize = useAuthStore((s) => s.initialize);
  const initialized = useAuthStore((s) => s.initialized);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    hydrate();
    initialize();
  }, []);

  useEffect(() => {
    if (theme) {
      Uniwind.setTheme(theme);
    }
  }, [theme]);

  useEffect(() => {
    if (fontsLoaded && initialized) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, initialized]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider config={config}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={!onboarded}>
            <Stack.Screen name="onboarding" />
          </Stack.Protected>

          <Stack.Protected guard={onboarded && !user}>
            <Stack.Screen name="(auth)" />
          </Stack.Protected>

          <Stack.Protected guard={onboarded && !!user}>
            <Stack.Screen name="index" />
          </Stack.Protected>
        </Stack>

        <StatusBar style="auto" />
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
