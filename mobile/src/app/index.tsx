import { usePreferencesStore } from "@/stores/preferences.store";
import { Redirect, router } from "expo-router";
import { Button } from "heroui-native";
import { StyleSheet, Text, View } from "react-native";

const Home = () => {
  const onboarded = usePreferencesStore((state) => state.preferences.onboarded);

  if (!onboarded) {
    return <Redirect href="/onboarding" />;
  }
  return (
    <View className="flex-1 items-center justify-center">
      <Text>Home</Text>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({});
