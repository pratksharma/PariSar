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

export default function RegisterForm() {
  const { register } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { toast } = useToast();
  const [success, danger] = useThemeColor(["success", "danger"]);

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const validate = () => {
    const nextErrors = {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    };

    if (!name.trim()) nextErrors.name = "Name is required.";

    if (!email.trim()) nextErrors.email = "Email is required.";

    if (!phone.trim()) nextErrors.phone = "Phone number is required.";

    if (!password) nextErrors.password = "Password is required.";

    if (!confirmPassword) nextErrors.confirmPassword = "Confirm your password.";

    if (password && confirmPassword && password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);

    return Object.values(nextErrors).every((value) => value === "");
  };

  const handleRegister = async () => {
    if (!validate()) return;

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });

      toast.show({
        variant: "success",
        label: "Account created",
        description: "Welcome to PariSar.",
        icon: <Lucide name="shield-check" size={24} color={success} />,
      });
    } catch (err: any) {
      console.log(err.response?.data);
      if (err?.response?.data?.field == "email") {
        setErrors((prev) => ({
          ...prev,
          email: err?.response?.data?.message,
        }));
      } else if (err?.response?.data?.field == "phone") {
        setErrors((prev) => ({
          ...prev,
          phone: err?.response?.data?.message,
        }));
      }

      toast.show({
        variant: "danger",
        label: "Registration failed",
        description: err?.response?.data?.message ?? err.message,
        icon: <Lucide name="shield-alert" size={24} color={danger} />,
      });
    }
  };

  return (
    <View className="mt-6 w-full gap-5">
      <TextField isRequired isInvalid={!!errors.name}>
        <Label>Full Name</Label>

        <Input placeholder="John Doe" value={name} onChangeText={setName} returnKeyType="next" />

        <FieldError>{errors.name}</FieldError>
      </TextField>

      <TextField isRequired isInvalid={!!errors.email}>
        <Label>Email</Label>

        <Input
          placeholder="john@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
        />

        <FieldError>{errors.email}</FieldError>
      </TextField>

      <TextField isRequired isInvalid={!!errors.phone}>
        <Label>Phone Number</Label>

        <Input
          placeholder="+91 9876543210"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          returnKeyType="next"
        />

        <FieldError>{errors.phone}</FieldError>
      </TextField>

      <TextField isRequired isInvalid={!!errors.password}>
        <Label>Password</Label>

        <Input
          placeholder="Create a password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          returnKeyType="next"
        />

        <FieldError>{errors.password}</FieldError>
      </TextField>

      <TextField isRequired isInvalid={!!errors.confirmPassword}>
        <Label>Confirm Password</Label>

        <Input
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          returnKeyType="done"
          onSubmitEditing={handleRegister}
        />

        <FieldError>{errors.confirmPassword}</FieldError>
      </TextField>

      <Button onPress={handleRegister}>Create Account</Button>
    </View>
  );
}
