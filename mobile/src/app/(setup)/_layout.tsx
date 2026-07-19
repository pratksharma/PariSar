import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";

export default function SetupLayout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerBackground: () => {
          return (
            <LinearGradient
              colors={["rgba(245, 245, 245, 0.9)", "transparent"]}
              className="h-[150%]"
            />
          );
        },
        headerTitleStyle: {
          fontFamily: "SourceSerif4_500Medium",
          fontSize: 24,
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Home", headerShown: false }} />
      <Stack.Screen name="join" options={{ title: "Join" }} />
      <Stack.Screen name="create" options={{ title: "Create" }} />
    </Stack>
  );
}
