import { useEffect, useState } from "react";
import { RefreshControl, FlatList, View, ScrollView } from "react-native";
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

import { useNoticeStore, type NoticeTag } from "@/stores/noticeStore";
import { useAuthStore } from "@/stores/authStore";
import Lucide from "@react-native-vector-icons/lucide";

const Notices = () => {
  const { user } = useAuthStore();

  const notices = useNoticeStore((s) => s.notices);
  const loading = useNoticeStore((s) => s.loading);
  const getNotices = useNoticeStore((s) => s.getNotices);
  const deleteNotice = useNoticeStore((s) => s.deleteNotice);
  const createNotice = useNoticeStore((s) => s.createNotice);

  const [refreshing, setRefreshing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState<NoticeTag>("general");

  const updateNotice = useNoticeStore((s) => s.updateNotice);
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);
  const isEditing = editingNoticeId !== null;

  const { toast } = useToast();
  const [success, danger, accentSoftForeground] = useThemeColor([
    "success",
    "danger",
    "accent-soft-foreground",
  ]);

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

  if (loading && notices.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <Spinner />
      </View>
    );
  }

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
    if (!title.trim() || !description.trim()) return;

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
          icon: <Lucide name="square-pen" size={24} color={success} />,
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
          icon: <Lucide name="megaphone" size={24} color={success} />,
        });
      }

      resetForm();
      setIsOpen(false);
    } catch (err: any) {
      toast.show({
        variant: "danger",
        label: isEditing ? "Couldn't Update Notice" : "Couldn't Publish Notice",
        description: err?.response?.data?.message ?? "Something went wrong. Please try again.",
        icon: <Lucide name="triangle-alert" size={24} color={danger} />,
      });
    }
  };

  return (
    <>
      {isAdmin && (
        <>
          <Button
            isIconOnly
            className="absolute bottom-24 right-6 z-50 h-14 w-14 rounded-full"
            onPress={() => {
              resetForm();
              setIsOpen(true);
            }}
          >
            <Lucide name="plus" size={24} color="white" />
          </Button>
          <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen}>
            <BottomSheet.Portal>
              <BottomSheet.Overlay />

              <BottomSheet.Content keyboardBehavior="extend">
                <BottomSheet.Title>
                  <Typography.Heading type="h3">
                    {isEditing ? "Update Notice" : "Create Notice"}
                  </Typography.Heading>
                </BottomSheet.Title>

                <BottomSheet.Description className="mb-5">
                  {isEditing
                    ? "Update the notice details."
                    : "This notice will be visible to all residents."}
                </BottomSheet.Description>

                <View className="gap-4">
                  <View>
                    <Label>Title</Label>
                    <Input
                      value={title}
                      onChangeText={setTitle}
                      placeholder="Enter notice title"
                      className="bg-surface-tertiary"
                    />
                  </View>

                  <View>
                    <Label>Description</Label>

                    <TextArea
                      value={description}
                      onChangeText={setDescription}
                      numberOfLines={5}
                      placeholder="Enter notice description"
                      className="bg-surface-tertiary"
                    />
                  </View>

                  <View className="gap-2">
                    <Label>Tag</Label>

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
                          {item.charAt(0).toUpperCase() + item.slice(1)}
                        </Chip>
                      ))}
                    </View>
                  </View>

                  <Button onPress={handleSubmit}>
                    {isEditing ? "Save Changes" : "Publish Notice"}
                  </Button>
                </View>
              </BottomSheet.Content>
            </BottomSheet.Portal>
          </BottomSheet>
        </>
      )}
      <FlatList
        data={notices}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 100,
          gap: 14,
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center">
            <Typography.Heading className="text-xl font-semibold">No Notices</Typography.Heading>
            <Typography.Paragraph className="text-center opacity-60 mt-2">
              There are no notices issued yet.
            </Typography.Paragraph>
          </View>
        )}
        renderItem={({ item }) => (
          <Card>
            <Card.Body className="gap-3">
              <View className="flex-row justify-between items-start">
                <Typography className="text-lg font-semibold flex-1 mr-3">{item.title}</Typography>
                <Chip
                  size="md"
                  variant="secondary"
                  color={item.tag == "emergency" ? "danger" : "default"}
                >
                  {item.tag.charAt(0).toUpperCase() + item.tag.slice(1)}
                </Chip>
              </View>

              <Typography.Paragraph>{item.description}</Typography.Paragraph>

              <Description className="text-xs text-muted">
                Issued by{" "}
                <Typography.Paragraph type="body-xs">{item.issuedBy.name}</Typography.Paragraph> on{" "}
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
                    <Lucide name="clipboard-pen" size={16} color={accentSoftForeground} />
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
    </>
  );
};

export default Notices;
