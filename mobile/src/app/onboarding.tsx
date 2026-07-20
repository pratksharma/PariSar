import { Button, Typography, useThemeColor } from "heroui-native";
import { Image, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Lucide } from "@react-native-vector-icons/lucide";
import { usePreferencesStore } from "@/stores/preferences.store";

const Onboarding = () => {
  const insets = useSafeAreaInsets();
  const [themeBg, text] = useThemeColor(["background", "default"]);

  const setOnboarded = usePreferencesStore((state) => state.setOnboarded);

  async function finish() {
    await setOnboarded(true);
  }

  return (
    <View
      style={{
        paddingBottom: insets.bottom + 16,
      }}
      className="flex-1 bg-background"
    >
      <View className="relative">
        <Image source={require("@/assets/onboarding-banner.jpg")} className="w-full h-110" />
        <LinearGradient
          colors={["transparent", themeBg]}
          className="absolute bottom-0 left-0 right-0 h-50"
        />
      </View>
      <View className="flex-1 p-4 gap-4">
        <Typography.Heading type="h2" align="center" className="font-serif-medium">
          Connected{" "}
          <Typography.Heading type="h2" className="font-serif-medium-italic">
            Communities
          </Typography.Heading>{" "}
          Effortless, Daily Living
        </Typography.Heading>
        <Typography.Paragraph align="center" className="font-normal" color="muted">
          Manage visitors, stay updated with notices, raise complaints, and connect with your
          community—all from one secure and easy-to-use app.
        </Typography.Paragraph>
        <Button
          className="m-auto"
          feedbackVariant="scale-ripple"
          onPress={async () => {
            await finish();
          }}
        >
          <Button.Label>Get Started</Button.Label>
          <Lucide name="chevron-right" color={text} size={20} />
        </Button>
      </View>
    </View>
  );
};

export default Onboarding;
