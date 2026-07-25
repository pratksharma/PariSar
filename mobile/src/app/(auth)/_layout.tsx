import { Stack, Redirect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "@/stores/authStore";

export default function AuthLayout() {
  const user = useAuthStore((state) => state.user);

  if (user) {
    if (user.role === "guard" && !user.society) {
      return <Redirect href="/(auth)/guard-login" />;
    }

    return <Redirect href="/" />;
  }

  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerBackground: () => (
          <LinearGradient
            colors={["rgba(245,245,245,0.9)", "rgba(245,245,245,0.7)", "rgba(245,245,245,0)"]}
            className="h-full"
          />
        ),
        headerTitleStyle: {
          fontFamily: "SourceSerif4_500Medium",
          fontSize: 24,
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: "" }} />
      <Stack.Screen name="guard-login" options={{ title: "Guard Login" }} />
    </Stack>
  );
}
