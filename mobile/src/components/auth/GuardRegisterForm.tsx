import { useState } from "react";
import { View } from "react-native";
import {
  Button,
  Card,
  Chip,
  FieldError,
  Input,
  Label,
  Spinner,
  TextField,
  Typography,
  useThemeColor,
  useToast,
} from "heroui-native";
import { VerifiedGuardInvite, useAuthStore } from "@/stores/authStore";
import Lucide from "@react-native-vector-icons/lucide";
import { FadeIn } from "react-native-reanimated";

export default function GuardRegisterForm() {
  const registerGuard = useAuthStore((state) => state.registerGuard);
  const verifyGuardInvite = useAuthStore((state) => state.verifyGuardInvite);
  const loading = useAuthStore((state) => state.loading);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [verifyingCode, setVerifyingCode] = useState(false);
  const [verifiedInvite, setVerifiedInvite] = useState<VerifiedGuardInvite | null>(null);

  const [background] = useThemeColor(["background"]);
  const { toast } = useToast();
  const [success, danger] = useThemeColor(["success", "danger"]);

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    inviteCode: "",
    password: "",
    confirmPassword: "",
  });

  const handleVerifyCode = async (codeToVerify?: string) => {
    const targetCode = (codeToVerify ?? inviteCode).trim().toUpperCase();
    if (!targetCode) {
      setErrors((prev) => ({ ...prev, inviteCode: "Joining Code is required." }));
      return false;
    }

    setVerifyingCode(true);
    try {
      const invite = await verifyGuardInvite(targetCode);
      setVerifiedInvite(invite);
      if (invite.name && !name) setName(invite.name);
      if (invite.phone && !phone) setPhone(invite.phone);
      if (invite.email && !email) setEmail(invite.email);

      setErrors((prev) => ({ ...prev, inviteCode: "" }));
      toast.show({
        variant: "success",
        label: "Valid Joining Code",
        description: `Verified for ${invite.society.name}`,
      });
      return true;
    } catch (err: any) {
      setVerifiedInvite(null);
      setErrors((prev) => ({
        ...prev,
        inviteCode: err?.response?.data?.message ?? "Invalid or expired Joining Code.",
      }));
      return false;
    } finally {
      setVerifyingCode(false);
    }
  };

  const validate = () => {
    const nextErrors = {
      name: "",
      email: "",
      phone: "",
      inviteCode: "",
      password: "",
      confirmPassword: "",
    };

    if (!name.trim()) nextErrors.name = "Full Name is required.";
    if (!email.trim()) nextErrors.email = "Email is required.";
    if (!phone.trim()) nextErrors.phone = "Phone number is required.";
    if (!inviteCode.trim()) nextErrors.inviteCode = "Joining Code (Invite Code) is required.";
    if (!password) nextErrors.password = "Password is required.";
    if (!confirmPassword) nextErrors.confirmPassword = "Confirm your password.";
    if (password && confirmPassword && password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);
    return Object.values(nextErrors).every((val) => val === "");
  };

  const handleRegister = async () => {
    if (!validate()) return;

    try {
      await registerGuard({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        inviteCode: inviteCode.trim().toUpperCase(),
        password,
      });

      toast.show({
        variant: "success",
        label: "Guard Account Created",
        description: "Welcome! Joined society successfully.",
        icon: <Lucide name="shield-check" size={24} color={success} />,
      });
    } catch (err: any) {
      toast.show({
        variant: "danger",
        label: "Registration Failed",
        description: err?.response?.data?.message ?? err.message,
        icon: <Lucide name="shield-alert" size={24} color={danger} />,
      });
    }
  };

  return (
    <View className="mt-6 w-full gap-5">
      {/* Joining Code Field */}
      <TextField isRequired isInvalid={!!errors.inviteCode}>
        <Label>Joining Code (Invite Code)</Label>

        <View className="flex-row items-center gap-2">
          <View className="flex-1">
            <Input
              placeholder="e.g. A3F1B2C4"
              value={inviteCode}
              onChangeText={(val) => {
                setInviteCode(val.toUpperCase());
                setVerifiedInvite(null);
              }}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <Button
            variant="secondary"
            onPress={() => handleVerifyCode()}
            isDisabled={verifyingCode || !inviteCode.trim()}
          >
            {verifyingCode ? (
              <Spinner size="sm" />
            ) : (
              <Lucide name="search-check" size={16} />
            )}
            <Button.Label>Verify</Button.Label>
          </Button>
        </View>

        <FieldError>{errors.inviteCode}</FieldError>
      </TextField>

      {verifiedInvite && (
        <Card className="gap-2 bg-background-secondary p-3.5 rounded-xl">
          <View className="flex-row items-center justify-between">
            <Typography.Heading type="h5" className="font-semibold">
              {verifiedInvite.society.name}
            </Typography.Heading>
            <Chip variant="secondary" color="success">
              <Chip.Label>Verified</Chip.Label>
            </Chip>
          </View>
          <Typography.Paragraph color="muted" type="body-sm">
            {verifiedInvite.society.address}
          </Typography.Paragraph>
        </Card>
      )}

      <TextField isRequired isInvalid={!!errors.name}>
        <Label>Full Name</Label>
        <Input placeholder="Guard Name" value={name} onChangeText={setName} returnKeyType="next" />
        <FieldError>{errors.name}</FieldError>
      </TextField>

      <TextField isRequired isInvalid={!!errors.email}>
        <Label>Email</Label>
        <Input
          placeholder="guard@example.com"
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

      <Button onPress={handleRegister} isDisabled={loading}>
        {loading ? (
          <Spinner entering={FadeIn.delay(50)} color={background} />
        ) : (
          <>
            <Lucide name="shield-plus" size={18} color="white" />
            <Button.Label>Register as Guard</Button.Label>
          </>
        )}
      </Button>
    </View>
  );
}
