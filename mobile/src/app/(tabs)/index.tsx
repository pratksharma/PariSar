import { useAuthStore } from "@/stores/authStore";
import Lucide from "@react-native-vector-icons/lucide";
import { Button, Card, Chip, Separator, Typography, useThemeColor } from "heroui-native";
import { StyleSheet, Text, ScrollView, View } from "react-native";

const Home = () => {
  const user = useAuthStore((state) => state.user);
  const [muted, accent] = useThemeColor(["muted", "accent"]);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View className="px-4 py-25 gap-6">
        <View className="flex-row gap-2 overflow-scroll">
          <Card className="flex-1 gap-4">
            <Card.Header className="h-10 w-10 items-center justify-center rounded-full bg-background-secondary">
              <Lucide name="file-exclamation-point" size={20} />
            </Card.Header>
            <Card.Body>
              <Card.Title>
                <Typography.Heading type="h5" className="font-medium">
                  Raise a Complaint
                </Typography.Heading>
              </Card.Title>
            </Card.Body>
          </Card>
          <Card className="flex-1 gap-4">
            <Card.Header className="h-10 w-10 items-center justify-center rounded-full bg-background-secondary">
              <Lucide name="user-plus" size={20} />
            </Card.Header>
            <Card.Body>
              <Card.Title>
                <Typography.Heading type="h5" className="font-medium">
                  Pre-approve Visitor
                </Typography.Heading>
              </Card.Title>
            </Card.Body>
          </Card>
        </View>

        {user?.society && (
          <View className="gap-2">
            <Typography.Heading type="h4" className="ml-2 font-medium">
              Your Society
            </Typography.Heading>

            <Card className="gap-4">
              <Card.Header className="h-14 w-14 rounded-full bg-background-secondary items-center justify-center">
                <Lucide name="building-2" size={26} />
              </Card.Header>

              <Card.Body>
                <Typography.Heading type="h3" className="font-semibold">
                  {user.society.name}
                </Typography.Heading>
                <View className="flex-row items-center gap-2">
                  <Lucide name="map-pin" size={14} color={muted} />
                  <Typography.Paragraph color="muted">{user.society.address}</Typography.Paragraph>
                </View>
              </Card.Body>

              <Separator />

              <Card.Footer className="flex-row flex-wrap gap-2">
                <Chip variant="secondary" color="default">
                  <Lucide name="shield" size={14} />
                  <Chip.Label className="capitalize">{user.role}</Chip.Label>
                </Chip>
                <Chip variant="secondary" color="default">
                  <Lucide name="house" size={14} />
                  <Chip.Label>
                    {user.tower} • {user.flatNumber}
                  </Chip.Label>
                </Chip>
              </Card.Footer>
            </Card>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default Home;

const styles = StyleSheet.create({});
