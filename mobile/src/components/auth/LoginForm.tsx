import { useState } from "react";
import { View } from "react-native";
import {
  Button,
  FieldError,
  Input,
  Label,
  TextField,
  useThemeColor,
  useToast,
} from "heroui-native";
import { useAuthStore } from "@/stores/authStore";
import Lucide from "@react-native-vector-icons/lucide";

export default function LoginForm() {
  const login = useAuthStore((state) => state.login);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [identifierError, setIdentifierError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { toast } = useToast();
  const [success, danger] = useThemeColor(["success", "danger"]);

  const validate = () => {
    let valid = true;

    setIdentifierError("");
    setPasswordError("");

    if (!identifier.trim()) {
      setIdentifierError("Email or phone is required.");
      valid = false;
    }

    if (!password) {
      setPasswordError("Password is required.");
      valid = false;
    }

    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      await login(identifier.trim(), password);
      toast.show({
        variant: "success",
        label: "Welcome back",
        description: "Successfully signed in.",
        icon: <Lucide name="shield-check" size={24} color={success} />,
      });
    } catch (err: any) {
      toast.show({
        variant: "danger",
        label: "Login failed",
        description: err?.response?.data?.message ?? err.message,
        icon: <Lucide name="shield-alert" size={24} color={danger} />,
      });
    }
  };

  return (
    <View className="mt-6 w-full gap-5">
      <TextField isRequired isInvalid={!!identifierError}>
        <Label>Email or Phone</Label>

        <Input
          placeholder="Enter your email or phone"
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
        />

        <FieldError>{identifierError}</FieldError>
      </TextField>

      <TextField isRequired isInvalid={!!passwordError}>
        <Label>Password</Label>

        <Input
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />

        <FieldError>{passwordError}</FieldError>
      </TextField>

      <Button onPress={handleLogin}>Login</Button>
    </View>
  );
}
