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
      contentContainerClassName="px-4 py-25 gap-5"
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}

      <View className="items-center gap-4">
        <Avatar color="accent" className="relative h-24 w-24">
          <Avatar.Image source={require("@/assets/profile-icon.png")} asChild>
            <Image style={{ width: "100%", height: "100%" }} resizeMode="cover" />
          </Avatar.Image>
          <Text className="absolute z-10 font-medium text-2xl text-muted">
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </Text>
        </Avatar>

        <View className="items-center gap-2">
          <Typography.Heading type="h3">{user.name}</Typography.Heading>

          <Chip variant="secondary" color={roleColor}>
            <Chip.Label className="uppercase">{user.role}</Chip.Label>
          </Chip>
        </View>
      </View>

      {/* Account */}

      <Card>
        <Card.Body className="gap-4">
          <Card.Title>Account</Card.Title>

          <Separator />

          <View className="flex-row gap-3">
            <Lucide name="mail" size={20} />

            <View className="flex-1">
              <Typography.Paragraph color="muted" type="body-sm">
                Email
              </Typography.Paragraph>

              <Typography.Paragraph>{user.email}</Typography.Paragraph>
            </View>
          </View>

          <Separator />

          <View className="flex-row gap-3">
            <Lucide name="phone" size={20} />

            <View className="flex-1">
              <Typography.Paragraph color="muted" type="body-sm">
                Phone
              </Typography.Paragraph>

              <Typography.Paragraph>{user.phone}</Typography.Paragraph>
            </View>
          </View>

          <Separator />

          <View className="flex-row gap-3">
            <Lucide name="badge-check" size={20} />

            <View className="flex-1">
              <Typography.Paragraph color="muted" type="body-sm">
                Approval Status
              </Typography.Paragraph>

              <Typography.Paragraph>{user.approvalStatus}</Typography.Paragraph>
            </View>
          </View>
        </Card.Body>
      </Card>

      {/* Society */}

      {user.society && (
        <Card>
          <Card.Body className="gap-4">
            <Card.Title>Society</Card.Title>

            <Separator />

            <View className="flex-row gap-3">
              <Lucide name="building-2" size={20} />

              <View className="flex-1">
                <Typography.Paragraph color="muted" type="body-sm">
                  Name
                </Typography.Paragraph>

                <Typography.Paragraph>{user.society.name}</Typography.Paragraph>
              </View>
            </View>

            <Separator />

            <View className="flex-row gap-3">
              <Lucide name="map-pinned" size={20} />

              <View className="flex-1">
                <Typography.Paragraph color="muted" type="body-sm">
                  Address
                </Typography.Paragraph>

                <Typography.Paragraph>{user.society.address}</Typography.Paragraph>
              </View>
            </View>

            <Separator />

            <View className="flex-row gap-3">
              <Lucide name="hash" size={20} />

              <View className="flex-1">
                <Typography.Paragraph color="muted" type="body-sm">
                  Society Code
                </Typography.Paragraph>

                <Typography.Paragraph>{user.society.uniqueCode}</Typography.Paragraph>
              </View>
            </View>

            <Separator />

            <View className="flex-row justify-between">
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
      )}

      {/* Description */}

      {user.society?.description && (
        <Card>
          <Card.Body className="gap-3">
            <Card.Title>Description</Card.Title>

            <Separator />

            <View className="flex-row gap-3">
              <Lucide name="clipboard-list" size={20} />

              <Typography.Paragraph className="flex-1">
                {user.society.description}
              </Typography.Paragraph>
            </View>
          </Card.Body>
        </Card>
      )}

      {/* Logout */}

      <Button
        variant="danger"
        onPress={async () => {
          await logout();

          toast.show({
            variant: "default",
            label: "Signed out",
            description: "You have been logged out.",
            icon: <Lucide name="circle-check" size={22} color={""} />,
          });
        }}
      >
        <Lucide name="log-out" size={18} color={accentForeground} />
        <Button.Label>Logout</Button.Label>
      </Button>
    </ScrollView>
  );
}
