import { useAuthStore } from "@/stores/authStore";
import Lucide from "@react-native-vector-icons/lucide";
import { Button, useThemeColor, useToast } from "heroui-native";
import { StyleSheet, Text, View } from "react-native";

const Home = () => {
  const logout = useAuthStore((state) => state.logout);
  const { toast } = useToast();

  return (
    <View className="flex-1 items-center justify-center">
      <Text>Home</Text>
      <Button
        onPress={async () => {
          await logout();

          toast.show({
            variant: "default",
            label: "Signed out",
            description: "You have been logged out.",
            icon: <Lucide name="circle-check" size={20} />,
          });
        }}
      >
        Logout
      </Button>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({});
