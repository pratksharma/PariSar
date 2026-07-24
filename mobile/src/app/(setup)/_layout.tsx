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
              colors={[
                "rgba(245, 245, 245, 0.9)",
                "rgba(245, 245, 245, 0.7)",
                "rgba(245, 245, 245, 0)",
              ]}
              className="h-full"
            />
          );
        },
        headerTitleStyle: {
          fontFamily: "SourceSerif4_500Medium",
          fontSize: 24,
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Society Setup", headerShown: false }} />
      <Stack.Screen name="join" options={{ title: "Join" }} />
      <Stack.Screen name="create" options={{ title: "Create" }} />
      <Stack.Screen name="complete-residence" options={{ title: "Residence Details" }} />
    </Stack>
  );
}
