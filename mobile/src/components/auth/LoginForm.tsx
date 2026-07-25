import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import {
  Button,
  FieldError,
  Input,
  InputGroup,
  Label,
  Spinner,
  TextField,
  useThemeColor,
  useToast,
} from "heroui-native";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "expo-router";
import Lucide from "@react-native-vector-icons/lucide";
import { FadeIn } from "react-native-reanimated";

export default function LoginForm() {
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [identifierError, setIdentifierError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [background, muted] = useThemeColor(["background", "muted"]);

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

        <InputGroup>
          <InputGroup.Input
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />
          <InputGroup.Suffix>
            <Pressable onPress={() => setShowPassword((prev) => !prev)} hitSlop={10} className="p-1">
              <Lucide name={showPassword ? "eye-off" : "eye"} size={20} color={muted} />
            </Pressable>
          </InputGroup.Suffix>
        </InputGroup>

        <FieldError>{passwordError}</FieldError>
      </TextField>

      <Button onPress={handleLogin}>
        {loading ? (
          <Spinner entering={FadeIn.delay(50)} color={background} />
        ) : (
          <Button.Label>Login</Button.Label>
        )}
      </Button>

      <Pressable onPress={() => router.push("/(auth)/guard-login")}>
        <Text className="text-center text-sm text-muted underline">
          Security Guard? Go to Guard Portal
        </Text>
      </Pressable>
    </View>
  );
}
