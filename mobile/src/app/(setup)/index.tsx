import Lucide from "@react-native-vector-icons/lucide";
import { router } from "expo-router";
import { Card, PressableFeedback, Typography } from "heroui-native";
import { Text, View } from "react-native";

export default function SetupScreen() {
  return (
    <View className="flex-1 items-center gap-4 bg-background px-6 pt-32 pb-4">
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
  );
}
