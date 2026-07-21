import { Tabs } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Lucide from "@react-native-vector-icons/lucide";
import { Image } from "react-native";
import { useAuthStore } from "../../stores/authStore";
import TabBar from "@/components/ui/TabBar";
import { useThemeColor } from "heroui-native";

export default function TabLayout() {
  const [muted] = useThemeColor(["muted"]);
  const user = useAuthStore((s) => s.user);
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
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
        tabBarInactiveTintColor: muted,
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
          tabBarIcon: () => {
            return (
              <Image
                source={require("@/assets/profile-icon.png")}
                className="h-5 w-5 rounded-full"
              />
            );
          },
        }}
      />
    </Tabs>
  );
}
