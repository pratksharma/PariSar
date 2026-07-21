import { LinearGradient } from "expo-linear-gradient";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Tabs } from "heroui-native";

export default function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: insets.bottom + 8,
      }}
    >
      <LinearGradient
        colors={["transparent", "rgba(245, 245, 245, 0.7)", "rgba(245, 245, 245, 1)"]}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "100%",
        }}
      />

      <Tabs
        className="px-4"
        value={state.routes[state.index].key}
        onValueChange={(key) => {
          const route = state.routes.find((r) => r.key === key);

          if (!route) return;

          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        }}
      >
        <Tabs.List className="w-full self-center rounded-full p-1">
          <Tabs.Indicator className="rounded-full" />

          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const focused = state.index === index;
            const color = focused
              ? (options.tabBarActiveTintColor ?? "#111827")
              : (options.tabBarInactiveTintColor ?? "#6B7280");

            const icon =
              typeof options.tabBarIcon === "function"
                ? options.tabBarIcon({
                    focused,
                    color,
                    size: 20,
                  })
                : null;

            const label =
              typeof options.tabBarLabel === "string"
                ? options.tabBarLabel
                : (options.title ?? route.name);

            return (
              <Tabs.Trigger key={route.key} value={route.key} className="flex-1 flex-col gap-0">
                {icon}
                <Tabs.Label className="text-sm">{label}</Tabs.Label>
              </Tabs.Trigger>
            );
          })}
        </Tabs.List>
      </Tabs>
    </View>
  );
}
