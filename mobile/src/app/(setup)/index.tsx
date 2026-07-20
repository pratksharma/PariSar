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

      <Typography.Paragraph className="font-medium text-center text-muted">
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
                <Text className="text-base font-serif-medium">Create a Society</Text>
              </Card.Title>

              <Card.Description>
                <Text className="text-sm font-regular text-muted">
                  Become the administrator of a new society.
                </Text>
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
                <Text className="text-base font-serif-medium">Join a Society</Text>
              </Card.Title>

              <Card.Description>
                <Text className="text-sm font-regular text-muted">
                  Join an existing society using a unique code.
                </Text>
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
