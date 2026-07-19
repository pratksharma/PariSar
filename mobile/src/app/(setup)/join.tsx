import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { Button, FieldError, Input, Label, TextField, Typography } from "heroui-native";

export default function Join() {
  const [societyCode, setSocietyCode] = useState("");
  const [tower, setTower] = useState("");
  const [flatNumber, setFlatNumber] = useState("");

  const [errors, setErrors] = useState({
    societyCode: "",
    tower: "",
    flatNumber: "",
  });

  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {
      societyCode: "",
      tower: "",
      flatNumber: "",
    };

    if (!societyCode.trim()) {
      newErrors.societyCode = "Society code is required.";
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

    setLoading(true);

    try {
      // TODO: Call join society API
      console.log({
        societyCode,
        tower,
        flatNumber,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView
        contentContainerClassName="px-4 pt-32 pb-4 gap-4"
        keyboardShouldPersistTaps="handled"
      >
        <Typography.Heading type="h2" className="font-serif-medium text-center">
          Join Society
        </Typography.Heading>

        <Typography.Paragraph className="font-medium text-center text-muted">
          Enter your society details to send a request to the administrator.
        </Typography.Paragraph>

        <View className="mt-4 gap-5">
          <TextField isRequired isInvalid={!!errors.societyCode}>
            <Label>Society Code</Label>

            <Input
              value={societyCode}
              onChangeText={(text) => setSocietyCode(text.toUpperCase())}
              placeholder="ABC123"
              autoCapitalize="characters"
              autoCorrect={false}
            />

            <FieldError>{errors.societyCode}</FieldError>
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
            Send Request
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
