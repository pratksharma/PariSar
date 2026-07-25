import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";

export default function StackLayout() {
  return (
    <Stack
      screenOptions={{
        animation: "simple_push",
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
      <Stack.Screen name="amenities/index" options={{ title: "Amenities" }} />
      <Stack.Screen name="amenities/book" options={{ title: "Book Amenity" }} />
      <Stack.Screen name="visitor-create" options={{ title: "Add Visitor" }} />
      <Stack.Screen name="invite-guard" options={{ title: "Invite Guard" }} />
      <Stack.Screen name="complaints" options={{ title: "Complaints" }} />
      <Stack.Screen name="complaint-create" options={{ title: "Raise Complaint" }} />
      <Stack.Screen name="notice-create" options={{ title: "Notice Form" }} />
      <Stack.Screen name="society" options={{ title: "Society" }} />
    </Stack>
  );
}
