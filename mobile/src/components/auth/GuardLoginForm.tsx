import { useState } from "react";
import { Pressable, View } from "react-native";
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
import Lucide from "@react-native-vector-icons/lucide";
import { FadeIn } from "react-native-reanimated";

export default function GuardLoginForm() {
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);

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
      await login(identifier.trim(), password, "guard");
      toast.show({
        variant: "success",
        label: "Guard Authenticated",
        description: "Welcome back to your security shift.",
        icon: <Lucide name="shield-check" size={24} color={success} />,
      });
    } catch (err: any) {
      toast.show({
        variant: "danger",
        label: "Guard Login Failed",
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
          placeholder="Enter guard email or phone"
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

      <Button onPress={handleLogin} isDisabled={loading}>
        {loading ? (
          <Spinner entering={FadeIn.delay(50)} color={background} />
        ) : (
          <>
            <Lucide name="shield-check" size={18} />
            <Button.Label>Sign In as Guard</Button.Label>
          </>
        )}
      </Button>
    </View>
  );
}
