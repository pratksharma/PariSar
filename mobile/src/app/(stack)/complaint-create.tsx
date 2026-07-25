import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import {
  Button,
  FieldError,
  Input,
  Label,
  Spinner,
  TextArea,
  TextField,
  Typography,
  useThemeColor,
  useToast,
} from "heroui-native";
import { FadeIn } from "react-native-reanimated";
import Lucide from "@react-native-vector-icons/lucide";

import { useComplaintStore } from "@/stores/complaintStore";
import { useAuthStore } from "@/stores/authStore";

export default function ComplaintCreate() {
  const router = useRouter();

  const user = useAuthStore((s) => s.user);
  const isResident = user?.role === "resident";

  const createComplaint = useComplaintStore((s) => s.createComplaint);
  const loading = useComplaintStore((s) => s.loading);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [errors, setErrors] = useState({
    title: "",
    description: "",
  });

  const { toast } = useToast();
  const [success, danger, background] = useThemeColor(["success", "danger", "background"]);

  if (!isResident) {
    return (
      <View className="flex-1 items-center justify-center px-6 bg-background">
        <Lucide name="shield-alert" size={48} color={danger} />
        <Typography.Heading type="h3" className="mt-4 text-center font-medium">
          Access Denied
        </Typography.Heading>
        <Typography.Paragraph color="muted" className="text-center mt-2">
          Only residents are allowed to raise new complaints.
        </Typography.Paragraph>
        <Button className="mt-6" onPress={() => router.back()}>
          <Button.Label>Go Back</Button.Label>
        </Button>
      </View>
    );
  }

  const validate = () => {
    const newErrors = {
      title: "",
      description: "",
    };

    if (!title.trim()) newErrors.title = "Complaint title is required.";
    if (!description.trim()) newErrors.description = "Description is required.";

    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await createComplaint({
        title: title.trim(),
        description: description.trim(),
      });

      toast.show({
        variant: "success",
        label: "Complaint Submitted",
        description: "Your complaint has been submitted to society management.",
        icon: <Lucide name="check-circle-2" size={24} color={success} />,
      });

      router.back();
    } catch (err: any) {
      toast.show({
        variant: "danger",
        label: "Submission Failed",
        description: err?.response?.data?.message ?? "Could not submit complaint.",
        icon: <Lucide name="circle-alert" size={24} color={danger} />,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="px-4 pt-28 pb-28 gap-4"
        showsVerticalScrollIndicator={false}
      >
        <Typography.Paragraph color="muted" className="text-center">
          Describe the issue clearly so society management can review and resolve it.
        </Typography.Paragraph>

        <View className="mt-4 gap-5">
          <TextField isRequired isInvalid={!!errors.title}>
            <Label>Title</Label>
            <Input
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Water Leakage in Tower A"
              returnKeyType="next"
            />
            {errors.title ? <FieldError>{errors.title}</FieldError> : null}
          </TextField>

          <TextField isRequired isInvalid={!!errors.description}>
            <Label>Description</Label>
            <TextArea
              value={description}
              onChangeText={setDescription}
              placeholder="Explain the problem in detail"
              numberOfLines={6}
            />
            {errors.description ? <FieldError>{errors.description}</FieldError> : null}
          </TextField>

          <Button className="w-full mt-3" onPress={handleSubmit}>
            {loading ? (
              <Spinner entering={FadeIn.delay(50)} color={background} />
            ) : (
              <>
                <Lucide name="message-square-plus" size={18} color="white" />
                <Button.Label>Submit Complaint</Button.Label>
              </>
            )}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
