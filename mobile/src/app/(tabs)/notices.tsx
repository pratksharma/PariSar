import { useEffect, useState } from "react";
import { RefreshControl, FlatList, ScrollView, View } from "react-native";
import {
  Button,
  Card,
  Chip,
  Spinner,
  Typography,
  BottomSheet,
  Input,
  Label,
  TextArea,
  Description,
  useToast,
  useThemeColor,
} from "heroui-native";
import Lucide from "@react-native-vector-icons/lucide";

import { useNoticeStore, type NoticeTag } from "@/stores/noticeStore";
import { useAuthStore } from "@/stores/authStore";

import { BottomSheetInput, BottomSheetTextArea } from "@/components/ui/BottomSheetInputs";

export default function Notices() {
  const user = useAuthStore((s) => s.user);

  const notices = useNoticeStore((s) => s.notices);
  const loading = useNoticeStore((s) => s.loading);
  const getNotices = useNoticeStore((s) => s.getNotices);
  const deleteNotice = useNoticeStore((s) => s.deleteNotice);
  const createNotice = useNoticeStore((s) => s.createNotice);
  const updateNotice = useNoticeStore((s) => s.updateNotice);

  const [refreshing, setRefreshing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState<NoticeTag>("general");
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);
  const isEditing = editingNoticeId !== null;

  const { toast } = useToast();
  const [success, danger] = useThemeColor(["success", "danger"]);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    getNotices();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await getNotices();
    } finally {
      setRefreshing(false);
    }
  };

  const openEditSheet = (notice: (typeof notices)[number]) => {
    setEditingNoticeId(notice._id);
    setTitle(notice.title);
    setDescription(notice.description);
    setTag(notice.tag);
    setIsOpen(true);
  };

  const resetForm = () => {
    setEditingNoticeId(null);
    setTitle("");
    setDescription("");
    setTag("general");
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast.show({
        variant: "danger",
        label: "Validation Error",
        description: "Title and description are required.",
      });
      return;
    }

    try {
      if (isEditing) {
        await updateNotice(editingNoticeId!, {
          title,
          description,
          tag,
        });

        toast.show({
          variant: "success",
          label: "Notice Updated",
          description: "The notice has been updated successfully.",
        });
      } else {
        await createNotice({
          title,
          description,
          tag,
        });

        toast.show({
          variant: "success",
          label: "Notice Published",
          description: "Your notice has been shared with all residents.",
        });
      }

      resetForm();
      setIsOpen(false);
    } catch (err: any) {
      toast.show({
        variant: "danger",
        label: isEditing ? "Couldn't Update Notice" : "Couldn't Publish Notice",
        description: err?.response?.data?.message ?? "Something went wrong. Please try again.",
      });
    }
  };

  if (loading && notices.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <Spinner />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={notices}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 100,
          paddingBottom: 100,
          gap: 14,
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={() => (
          <View className="mb-2">
            <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen}>
              <View className="flex-row items-center justify-between gap-3 mb-2">
                {notices.length > 0 ? (
                  <Typography.Paragraph color="muted" className="flex-1">
                    Society announcements and official updates.
                  </Typography.Paragraph>
                ) : (
                  <View className="flex-1" />
                )}

                {isAdmin ? (
                  <BottomSheet.Trigger asChild>
                    <Button onPress={resetForm}>
                      <Lucide name="plus" size={18} color="white" />
                      <Button.Label>Add Notice</Button.Label>
                    </Button>
                  </BottomSheet.Trigger>
                ) : null}
              </View>

              <BottomSheet.Portal>
                <BottomSheet.Overlay />
                <BottomSheet.Content keyboardBehavior="extend">
                  <ScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerClassName="gap-4 pb-4"
                  >
                    <View className="mb-2 gap-1">
                      <BottomSheet.Title>
                        <Typography.Heading type="h3">
                          {isEditing ? "Update Notice" : "Create Notice"}
                        </Typography.Heading>
                      </BottomSheet.Title>
                      <BottomSheet.Description>
                        {isEditing
                          ? "Update the details of this notice."
                          : "Publish an announcement to all society residents."}
                      </BottomSheet.Description>
                    </View>

                    <View className="gap-1.5">
                      <Label>Title</Label>
                      <BottomSheetInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Enter notice title"
                        className="bg-background-secondary"
                        returnKeyType="next"
                      />
                    </View>

                    <View className="gap-1.5">
                      <Label>Description</Label>
                      <BottomSheetTextArea
                        value={description}
                        onChangeText={setDescription}
                        numberOfLines={4}
                        placeholder="Enter notice description"
                        className="bg-background-secondary"
                      />
                    </View>

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

                    <View className="gap-3 mt-3">
                      <Button onPress={handleSubmit}>
                        <Button.Label>{isEditing ? "Save Changes" : "Publish Notice"}</Button.Label>
                      </Button>

                      <Button
                        variant="tertiary"
                        onPress={() => {
                          resetForm();
                          setIsOpen(false);
                        }}
                      >
                        <Button.Label>Cancel</Button.Label>
                      </Button>
                    </View>
                  </ScrollView>
                </BottomSheet.Content>
              </BottomSheet.Portal>
            </BottomSheet>
          </View>
        )}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center py-12">
            <Typography.Heading type="h4" className="font-medium">
              No Notices Yet
            </Typography.Heading>
            <Typography.Paragraph color="muted" className="text-center mt-1">
              There are no notices issued for your society.
            </Typography.Paragraph>
          </View>
        )}
        renderItem={({ item }) => (
          <Card>
            <Card.Body className="gap-3">
              <View className="flex-row justify-between items-start">
                <Typography.Heading type="h5" className="flex-1 mr-3">
                  {item.title}
                </Typography.Heading>
                <Chip
                  size="md"
                  variant="secondary"
                  color={item.tag === "emergency" ? "danger" : "default"}
                >
                  <Chip.Label className="capitalize">{item.tag}</Chip.Label>
                </Chip>
              </View>

              <Typography.Paragraph>{item.description}</Typography.Paragraph>

              <Description className="text-xs color-muted">
                Issued by {item.issuedBy?.name ?? "Admin"} on{" "}
                {new Date(item.createdAt).toLocaleDateString()}
              </Description>

              {isAdmin && (
                <View className="flex-row gap-2 pt-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    variant="secondary"
                    onPress={() => openEditSheet(item)}
                  >
                    <Lucide name="clipboard-pen" size={16} />
                    <Button.Label>Edit</Button.Label>
                  </Button>

                  <Button
                    size="sm"
                    className="flex-1"
                    variant="danger"
                    onPress={() => deleteNotice(item._id)}
                  >
                    <Lucide name="trash" size={16} color="white" />
                    <Button.Label>Delete</Button.Label>
                  </Button>
                </View>
              )}
            </Card.Body>
          </Card>
        )}
      />
    </View>
  );
}
