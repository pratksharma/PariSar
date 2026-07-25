import { View } from "react-native";
import { Button, Card, Typography, useToast } from "heroui-native";
import Lucide from "@react-native-vector-icons/lucide";

import { useAuthStore } from "@/stores/authStore";

export default function PendingApproval() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const refresh = useAuthStore((state) => state.getUser);
  const { toast } = useToast();

  return (
    <View className="flex-1 items-center justify-center px-4">
      <Card className="w-full max-w-xl">
        <Card.Body className="gap-4">
          <Typography.Heading type="h3">Waiting for approval</Typography.Heading>
          <Typography.Paragraph color="muted">
            {user?.role === "resident"
              ? "Your society request is pending admin approval."
              : "Your account is not ready yet."}
          </Typography.Paragraph>

          <Button
            onPress={async () => {
              await refresh();
              toast.show({
                variant: "default",
                label: "Refreshed",
                description: "We checked your latest approval status.",
              });
            }}
          >
            <Lucide name="refresh-cw" size={18} />
            <Button.Label>Refresh Status</Button.Label>
          </Button>

          <Button
            variant="secondary"
            onPress={async () => {
              await logout();
            }}
          >
            <Button.Label>Sign Out</Button.Label>
          </Button>
        </Card.Body>
      </Card>
    </View>
  );
}
