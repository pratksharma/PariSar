import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";

export default function StackLayout() {
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
      <Stack.Screen name="amenities" options={{ title: "Amenities" }} />
      <Stack.Screen name="complaints" options={{ title: "Complaints" }} />
      <Stack.Screen name="society" options={{ title: "Society" }} />
    </Stack>
  );
}
