import Lucide from "@react-native-vector-icons/lucide";
import { router } from "expo-router";
import { Button, Card, PressableFeedback, Typography, useThemeColor } from "heroui-native";
import { useEffect } from "react";
import { View } from "react-native";

import { useAuthStore } from "@/stores/authStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SetupScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [defaultText] = useThemeColor(["default"]);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (user?.society && user.approvalStatus !== "APPROVED" && user.role === "resident") {
      router.replace("/(setup)/pending-approval");
    }
  }, [user]);

  if (user?.society && user.approvalStatus !== "APPROVED" && user.role === "resident") {
    return null;
  }

  return (
    <View
      className="flex-1 items-center justify-between bg-background px-6 pt-28"
      style={{
        paddingBottom: insets.bottom + 16,
      }}
    >
      <View className="items-center gap-4 w-full">
        <Typography.Heading type="h2" className="font-serif-medium text-center">
          Let's get you settled
        </Typography.Heading>

        <Typography.Paragraph color="muted" className="text-center">
          Choose how you'd like to begin your journey with SocietyHub.
        </Typography.Paragraph>

        <View className="mt-4 gap-4 w-full">
          <PressableFeedback
            onPress={() => router.push("/(setup)/create")}
            className="overflow-auto w-full"
          >
            <Card className="flex-row items-center gap-4">
              <Card.Header className="bg-background-secondary p-4 rounded-xl">
                <Lucide name="house-plus" size={24} />
              </Card.Header>

              <Card.Body className="flex-1 min-w-0">
                <Card.Title>
                  <Typography.Heading type="h5">Create a Society</Typography.Heading>
                </Card.Title>

                <Card.Description>
                  <Typography.Paragraph color="muted" type="body-sm">
                    Become the administrator of a new society.
                  </Typography.Paragraph>
                </Card.Description>
              </Card.Body>

              <Card.Footer>
                <Lucide name="arrow-right" size={20} />
              </Card.Footer>
            </Card>
          </PressableFeedback>

          <PressableFeedback
            onPress={() => router.push("/(setup)/join")}
            className="overflow-auto w-full"
          >
            <Card className="flex-row items-center gap-4">
              <Card.Header className="bg-background-secondary p-4 rounded-xl">
                <Lucide name="user-round-plus" size={24} />
              </Card.Header>

              <Card.Body className="flex-1 min-w-0">
                <Card.Title>
                  <Typography.Heading type="h5">Join a Society</Typography.Heading>
                </Card.Title>

                <Card.Description>
                  <Typography.Paragraph color="muted" type="body-sm">
                    Join an existing society using a unique code.
                  </Typography.Paragraph>
                </Card.Description>
              </Card.Body>

              <Card.Footer>
                <Lucide name="arrow-right" size={20} />
              </Card.Footer>
            </Card>
          </PressableFeedback>
        </View>
      </View>

      <Button
        variant="secondary"
        className="w-full"
        onPress={async () => {
          await logout();
        }}
      >
        <Lucide name="arrow-left" size={18} color={defaultText} />
        <Button.Label>Go Back & Log Out</Button.Label>
      </Button>
    </View>
  );
}
