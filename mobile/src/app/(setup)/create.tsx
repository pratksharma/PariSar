import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { Button, TextField, Label, Input, TextArea, FieldError, Typography } from "heroui-native";

export default function Create() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");

  const [errors, setErrors] = useState({
    name: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {
      name: "",
      address: "",
    };

    if (!name.trim()) newErrors.name = "Society name is required.";
    if (!address.trim()) newErrors.address = "Address is required.";

    setErrors(newErrors);

    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      // TODO: Call your create society API
      console.log({
        name,
        address,
        description,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      // className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        // className="flex-1"
        contentContainerClassName="px-4 pt-32 pb-4 gap-4"
        keyboardShouldPersistTaps="handled"
      >
        <Typography.Heading type="h2" className="font-serif-medium text-center">
          Create Society
        </Typography.Heading>

        <Typography.Paragraph className="font-medium text-center text-muted">
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

          <TextField isInvalid={!!errors.address}>
            <Label>Description</Label>

            <TextArea
              value={description}
              onChangeText={setDescription}
              placeholder="Enter a description"
              numberOfLines={6}
            />
          </TextField>

          <Button className="w-full mt-2" onPress={handleSubmit}>
            Create Society
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
