import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Button,
  Chip,
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

import { useNoticeStore, type NoticeTag } from "@/stores/noticeStore";
import { useAuthStore } from "@/stores/authStore";

export default function NoticeCreate() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    title?: string;
    description?: string;
    tag?: string;
  }>();

  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "admin";

  const createNotice = useNoticeStore((s) => s.createNotice);
  const updateNotice = useNoticeStore((s) => s.updateNotice);
  const loading = useNoticeStore((s) => s.loading);

  const isEditing = Boolean(params.id);

  const [title, setTitle] = useState(params.title ?? "");
  const [description, setDescription] = useState(params.description ?? "");
  const [tag, setTag] = useState<NoticeTag>((params.tag as NoticeTag) ?? "general");

  const [errors, setErrors] = useState({
    title: "",
    description: "",
  });

  const { toast } = useToast();
  const [success, danger, background] = useThemeColor(["success", "danger", "background"]);

  if (!isAdmin) {
    return (
      <View className="flex-1 items-center justify-center px-6 bg-background">
        <Lucide name="shield-alert" size={48} color={danger} />
        <Typography.Heading type="h3" className="mt-4 text-center font-medium">
          Access Denied
        </Typography.Heading>
        <Typography.Paragraph color="muted" className="text-center mt-2">
          Only society administrators are allowed to publish or edit notices.
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

    if (!title.trim()) newErrors.title = "Notice title is required.";
    if (!description.trim()) newErrors.description = "Description is required.";

    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      if (isEditing && params.id) {
        await updateNotice(params.id, {
          title: title.trim(),
          description: description.trim(),
          tag,
        });

        toast.show({
          variant: "success",
          label: "Notice Updated",
          description: "The notice has been updated successfully.",
          icon: <Lucide name="check-circle-2" size={24} color={success} />,
        });
      } else {
        await createNotice({
          title: title.trim(),
          description: description.trim(),
          tag,
        });

        toast.show({
          variant: "success",
          label: "Notice Published",
          description: "Your notice has been shared with all residents.",
          icon: <Lucide name="check-circle-2" size={24} color={success} />,
        });
      }

      router.back();
    } catch (err: any) {
      toast.show({
        variant: "danger",
        label: isEditing ? "Couldn't Update Notice" : "Couldn't Publish Notice",
        description: err?.response?.data?.message ?? "Something went wrong. Please try again.",
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
          {isEditing
            ? "Update the details of this society announcement."
            : "Publish an announcement to all society residents."}
        </Typography.Paragraph>

        <View className="mt-4 gap-5">
          <TextField isRequired isInvalid={!!errors.title}>
            <Label>Title</Label>
            <Input
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Annual Society General Meeting"
              returnKeyType="next"
            />
            {errors.title ? <FieldError>{errors.title}</FieldError> : null}
          </TextField>

          <TextField isRequired isInvalid={!!errors.description}>
            <Label>Description</Label>
            <TextArea
              value={description}
              onChangeText={setDescription}
              placeholder="Enter complete notice details"
              numberOfLines={6}
            />
            {errors.description ? <FieldError>{errors.description}</FieldError> : null}
          </TextField>

          <View className="gap-2">
            <Label>Category Tag</Label>
            <View className="flex-row flex-wrap gap-2">
              {[
                "general",
                "maintenance",
                "security",
                "event",
                "emergency",
                "meeting",
                "payment",
                "other",
              ].map((item) => (
                <Chip
                  key={item}
                  variant={tag === item ? "primary" : "secondary"}
                  onPress={() => setTag(item as NoticeTag)}
                >
                  <Chip.Label className="capitalize">{item}</Chip.Label>
                </Chip>
              ))}
            </View>
          </View>

          <Button className="w-full mt-3" onPress={handleSubmit}>
            {loading ? (
              <Spinner entering={FadeIn.delay(50)} color={background} />
            ) : (
              <>
                <Lucide name={isEditing ? "save" : "send"} size={18} color="white" />
                <Button.Label>{isEditing ? "Save Changes" : "Publish Notice"}</Button.Label>
              </>
            )}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
