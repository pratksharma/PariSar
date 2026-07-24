import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import {
  Button,
  TextField,
  Label,
  Input,
  TextArea,
  FieldError,
  Typography,
  useThemeColor,
  Spinner,
} from "heroui-native";
import { FadeIn } from "react-native-reanimated";
import { useSocietyStore } from "@/stores/societyStore";
import { useToast } from "heroui-native";
import Lucide from "@react-native-vector-icons/lucide";

export default function Create() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [tower, setTower] = useState("");
  const [flatNumber, setFlatNumber] = useState("");

  const createSociety = useSocietyStore((s) => s.createSociety);
  const loading = useSocietyStore((s) => s.loading);

  const { toast } = useToast();

  const [success, danger, background] = useThemeColor(["success", "danger", "background"]);

  const [errors, setErrors] = useState({
    name: "",
    address: "",
    description: "",
    tower: "",
    flatNumber: "",
  });

  const validate = () => {
    const newErrors = {
      name: "",
      address: "",
      description: "",
      tower: "",
      flatNumber: "",
    };

    if (!name.trim()) newErrors.name = "Society name is required.";
    if (!address.trim()) newErrors.address = "Address is required.";
    if (!description.trim()) newErrors.description = "Description is required.";
    if (!tower.trim()) newErrors.tower = "Tower is required.";
    if (!flatNumber.trim()) newErrors.flatNumber = "Flat number is required.";

    setErrors(newErrors);

    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await createSociety({
        name,
        address,
        description,
        tower,
        flatNumber,
      });

      toast.show({
        variant: "success",
        label: "Society created",
        description: "Your society has been created successfully. You're now the administrator.",
        icon: <Lucide name="shield-check" size={24} color={success} />,
      });
    } catch (err: any) {
      toast.show({
        variant: "danger",
        label: "Creation failed",
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
          Create Society
        </Typography.Heading>

        <Typography.Paragraph color="muted" className="text-center">
          Create your society to become its administrator.
        </Typography.Paragraph>

        <View className="mt-4 gap-5">
          <TextField isRequired isInvalid={!!errors.name}>
            <Label>Society Name</Label>

            <Input
              value={name}
              onChangeText={setName}
              placeholder="Green Valley Residency"
              autoCapitalize="words"
            />

            <FieldError>{errors.name}</FieldError>
          </TextField>

          <TextField isRequired isInvalid={!!errors.address}>
            <Label>Address</Label>

            <Input value={address} onChangeText={setAddress} placeholder="Enter complete address" />

            <FieldError>{errors.address}</FieldError>
          </TextField>

          <View className="flex-row gap-4">
            <View className="flex-1">
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
            </View>

            <View className="flex-1">
              <TextField isRequired isInvalid={!!errors.flatNumber}>
                <Label>Flat Number</Label>

                <Input value={flatNumber} onChangeText={setFlatNumber} placeholder="302" />

                <FieldError>{errors.flatNumber}</FieldError>
              </TextField>
            </View>
          </View>

          <TextField isInvalid={!!errors.description}>
            <Label>Description</Label>

            <TextArea
              value={description}
              onChangeText={setDescription}
              placeholder="Enter a description"
              numberOfLines={6}
            />
            <FieldError>{errors.description}</FieldError>
          </TextField>

          <Button className="w-full mt-2" onPress={handleSubmit}>
            {loading ? (
              <Spinner entering={FadeIn.delay(50)} color={background} />
            ) : (
              "Create Society"
            )}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
