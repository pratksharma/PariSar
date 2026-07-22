import { useEffect, type JSX } from "react";
import { SplashScreen, Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { HeroUINativeConfig, HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Uniwind } from "uniwind";

import {
  useFonts,
  SourceSerif4_500Medium,
  SourceSerif4_500Medium_Italic,
  Outfit_100Thin,
  Outfit_200ExtraLight,
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
  Outfit_900Black,
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
    Outfit_100Thin,
    Outfit_200ExtraLight,
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    Outfit_900Black,
  });

  const hydrate = usePreferencesStore((s) => s.hydrate);
  const hydrated = usePreferencesStore((s) => s.hydrated);
  const theme = usePreferencesStore((s) => s.preferences.theme);
  const onboarded = usePreferencesStore((s) => s.preferences.onboarded);

  const initialize = useAuthStore((s) => s.initialize);
  const initialized = useAuthStore((s) => s.initialized);
  const user = useAuthStore((s) => s.user);

  const isOnboarding = !onboarded;
  const isLoggedOut = onboarded && !user;
  const needsSociety = onboarded && !!user && !user.society;
  const isReady = onboarded && !!user && !!user.society;

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
    if (fontsLoaded && initialized && hydrated) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, initialized, hydrated]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider config={config}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={isOnboarding}>
            <Stack.Screen name="onboarding" />
          </Stack.Protected>

          <Stack.Protected guard={isLoggedOut}>
            <Stack.Screen name="(auth)" />
          </Stack.Protected>

          <Stack.Protected guard={needsSociety}>
            <Stack.Screen name="(setup)" />
          </Stack.Protected>

          <Stack.Protected guard={isReady}>
            <Stack.Screen name="(tabs)" />
          </Stack.Protected>
        </Stack>

        <StatusBar style="auto" />
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
