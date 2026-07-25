import { Image, ScrollView, Text, View } from "react-native";
import {
  Avatar,
  Button,
  Card,
  Chip,
  Separator,
  Typography,
  useThemeColor,
  useToast,
} from "heroui-native";
import Lucide from "@react-native-vector-icons/lucide";

import { useAuthStore } from "@/stores/authStore";

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { toast } = useToast();
  const [accentForeground] = useThemeColor(["accent-foreground"]);

  if (!user) return null;

  const roleColor =
    user.role === "admin" ? "success" : user.role === "guard" ? "warning" : "accent";

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="px-4 pt-28 pb-28 gap-5"
      showsVerticalScrollIndicator={false}
    >
      <Card>
        <Card.Body className="gap-5">
          <View className="flex-row items-center gap-4">
            <Avatar color="accent" className="relative h-20 w-20">
              <Avatar.Image source={require("@/assets/profile-icon.png")} asChild>
                <Image style={{ width: "100%", height: "100%" }} resizeMode="cover" />
              </Avatar.Image>
              <Text className="absolute z-10 font-medium text-2xl text-muted">
                {user.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </Text>
            </Avatar>

            <View className="flex-1 gap-2">
              <Typography.Heading type="h3">{user.name}</Typography.Heading>
              <View className="flex-row flex-wrap gap-2">
                <Chip variant="secondary" color={roleColor}>
                  <Chip.Label className="uppercase">{user.role}</Chip.Label>
                </Chip>
                <Chip variant="secondary">
                  <Chip.Label>{user.approvalStatus}</Chip.Label>
                </Chip>
              </View>
            </View>
          </View>

          <Separator />

          <View className="flex-row flex-wrap gap-2">
            <Chip variant="secondary">
              <Lucide name="mail" size={14} />
              <Chip.Label>{user.email}</Chip.Label>
            </Chip>
            <Chip variant="secondary">
              <Lucide name="phone" size={14} />
              <Chip.Label>{user.phone}</Chip.Label>
            </Chip>
            {user.tower && user.flatNumber ? (
              <Chip variant="secondary">
                <Lucide name="home" size={14} />
                <Chip.Label>
                  {user.tower} • {user.flatNumber}
                </Chip.Label>
              </Chip>
            ) : null}
          </View>
        </Card.Body>
      </Card>

      {user.society ? (
        <Card>
          <Card.Body className="gap-4">
            <Card.Title>Society Summary</Card.Title>
            <View className="gap-2">
              <Typography.Heading type="h4">{user.society.name}</Typography.Heading>
              <Typography.Paragraph color="muted">{user.society.address}</Typography.Paragraph>
            </View>

            <View className="flex-row flex-wrap gap-2">
              {user.role === "admin" && user.society.uniqueCode ? (
                <Chip variant="secondary">
                  <Lucide name="hash" size={14} />
                  <Chip.Label>{user.society.uniqueCode}</Chip.Label>
                </Chip>
              ) : null}
              <Chip variant="secondary">
                <Lucide name="users" size={14} />
                <Chip.Label>{user.society.totalResidents} Residents</Chip.Label>
              </Chip>
              <Chip variant="secondary">
                <Lucide name="shield" size={14} />
                <Chip.Label>{user.society.totalGuards} Guards</Chip.Label>
              </Chip>
            </View>
          </Card.Body>
        </Card>
      ) : null}

      {user.society?.description ? (
        <Card>
          <Card.Body className="gap-3">
            <Card.Title>About the Society</Card.Title>
            <Typography.Paragraph>{user.society.description}</Typography.Paragraph>
          </Card.Body>
        </Card>
      ) : null}

      <Button
        variant="danger"
        onPress={async () => {
          await logout();
          toast.show({
            variant: "default",
            label: "Signed out",
            description: "You have been logged out.",
          });
        }}
      >
        <Lucide name="log-out" size={18} color="white" />
        <Button.Label>Logout</Button.Label>
      </Button>
    </ScrollView>
  );
}
