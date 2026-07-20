import { StyleSheet, Text, View } from "react-native";
import { Button, useToast } from "heroui-native";
import { useAuthStore } from "@/stores/authStore";
import Lucide from "@react-native-vector-icons/lucide";

const Profile = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { toast } = useToast();
  return (
    <View className="p-4 pt-25">
      <Text>{user?.name}</Text>
      <Button
        onPress={async () => {
          await logout();

          toast.show({
            variant: "default",
            label: "Signed out",
            description: "You have been logged out.",
            icon: <Lucide name="circle-check" size={24} />,
          });
        }}
      >
        Logout
      </Button>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({});
