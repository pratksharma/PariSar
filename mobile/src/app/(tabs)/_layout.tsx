import { Tabs } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Lucide from "@react-native-vector-icons/lucide";
import { Image } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
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
      <Tabs.Screen
        name="index"
        options={{
          title: "PariSar",
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
          tabBarIcon: ({ color, size }) => {
            return (
              <Image
                source={require("@/assets/onboarding-banner.jpg")}
                // height={size}
                // width={size}
                className={`h-6 w-6 rounded-full`}
              />
            );
          },
        }}
      />
    </Tabs>
  );
}
