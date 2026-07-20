import { Tabs } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Lucide from "@react-native-vector-icons/lucide";
import { Image } from "react-native";
import { useAuthStore } from "../../stores/authStore";

export default function TabLayout() {
  const user = useAuthStore((s) => s.user);
  return (
    <Tabs
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
      <Tabs.Screen
        name="index"
        options={{
          title: user ? `Hello, ${user.name}` : "PariSar",
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => {
            return <Lucide name="house" size={size} color={color} />;
          },
        }}
      />
      <Tabs.Screen
        name="visitors"
        options={{
          title: "Visitors",
          tabBarIcon: ({ color, size }) => {
            return <Lucide name="id-card-lanyard" size={size} color={color} />;
          },
        }}
      />
      <Tabs.Screen
        name="notices"
        options={{
          title: "Notices",
          tabBarIcon: ({ color, size }) => {
            return <Lucide name="clipboard-list" size={size} color={color} />;
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused, color, size }) => {
            return focused ? (
              <Image
                source={require("@/assets/profile-icon.png")}
                className="h-6 w-6 rounded-full outline-2 outline-muted"
              />
            ) : (
              <Image
                source={require("@/assets/profile-icon.png")}
                className="h-6 w-6 rounded-full"
              />
            );
          },
        }}
      />
    </Tabs>
  );
}
