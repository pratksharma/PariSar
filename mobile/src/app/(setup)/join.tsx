import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import {
  Button,
  FieldError,
  Input,
  Label,
  Spinner,
  TextField,
  Typography,
  useThemeColor,
  useToast,
} from "heroui-native";
import { FadeIn } from "react-native-reanimated";
import { useSocietyStore } from "@/stores/societyStore";
import Lucide from "@react-native-vector-icons/lucide";

export default function Join() {
  const joinSociety = useSocietyStore((s) => s.joinSociety);
  const loading = useSocietyStore((s) => s.loading);

  const [uniqueCode, setUniqueCode] = useState("");
  const [tower, setTower] = useState("");
  const [flatNumber, setFlatNumber] = useState("");

  const [errors, setErrors] = useState({
    uniqueCode: "",
    tower: "",
    flatNumber: "",
  });

  const { toast } = useToast();
  const [success, danger, background] = useThemeColor(["success", "danger", "background"]);

  const validate = () => {
    const newErrors = {
      uniqueCode: "",
      tower: "",
      flatNumber: "",
    };

    if (!uniqueCode.trim()) {
      newErrors.uniqueCode = "Society code is required.";
    }

    if (!tower.trim()) {
      newErrors.tower = "Tower is required.";
    }

    if (!flatNumber.trim()) {
      newErrors.flatNumber = "Flat number is required.";
    }

    setErrors(newErrors);

    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await joinSociety({
        uniqueCode,
        tower,
        flatNumber,
      });

      toast.show({
        variant: "success",
        label: "Request sent",
        description: "Your request has been sent to the society administrator for approval.",
        icon: <Lucide name="shield-check" size={24} color={success} />,
      });
    } catch (err: any) {
      console.error(err);
      toast.show({
        variant: "danger",
        label: "Request failed",
        description: err?.response?.data?.message ?? err.message,
        icon: <Lucide name="shield-alert" size={24} color={danger} />,
      });
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView
        contentContainerClassName="px-4 pt-28 pb-4 gap-4"
        keyboardShouldPersistTaps="handled"
      >
        <Typography.Heading type="h2" className="font-serif-medium text-center">
          Join Society
        </Typography.Heading>

        <Typography.Paragraph color="muted" className="text-center">
          Enter your society details to send a request to the administrator.
        </Typography.Paragraph>

        <View className="mt-4 gap-5">
          <TextField isRequired isInvalid={!!errors.uniqueCode}>
            <Label>Society Code</Label>

            <Input
              value={uniqueCode}
              onChangeText={(text) => setUniqueCode(text.toUpperCase())}
              placeholder="ABC123"
              autoCapitalize="characters"
              autoCorrect={false}
            />

            <FieldError>{errors.uniqueCode}</FieldError>
          </TextField>

          <TextField isRequired isInvalid={!!errors.tower}>
            <Label>Tower</Label>

            <Input
              value={tower}
              onChangeText={setTower}
              placeholder="A"
              autoCapitalize="characters"
            />

            <FieldError>{errors.tower}</FieldError>
          </TextField>

          <TextField isRequired isInvalid={!!errors.flatNumber}>
            <Label>Flat Number</Label>

            <Input
              value={flatNumber}
              onChangeText={setFlatNumber}
              placeholder="101"
              autoCapitalize="characters"
            />

            <FieldError>{errors.flatNumber}</FieldError>
          </TextField>

          <Button className="w-full mt-2" onPress={handleSubmit}>
            {loading ? <Spinner entering={FadeIn.delay(50)} color={background} /> : "Send Request"}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
