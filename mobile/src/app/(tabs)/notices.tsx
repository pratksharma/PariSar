import { useEffect, useState } from "react";
import { RefreshControl, FlatList, View } from "react-native";
import { useRouter } from "expo-router";
import {
  Button,
  Card,
  Chip,
  Description,
  Spinner,
  Typography,
} from "heroui-native";
import Lucide from "@react-native-vector-icons/lucide";

import { useNoticeStore } from "@/stores/noticeStore";
import { useAuthStore } from "@/stores/authStore";

export default function Notices() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const notices = useNoticeStore((s) => s.notices);
  const loading = useNoticeStore((s) => s.loading);
  const getNotices = useNoticeStore((s) => s.getNotices);
  const deleteNotice = useNoticeStore((s) => s.deleteNotice);

  const [refreshing, setRefreshing] = useState(false);
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
      <View className="flex-1 items-center justify-center bg-background">
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
          <View className="flex-row items-center justify-between gap-3 mb-2">
            {notices.length > 0 ? (
              <Typography.Paragraph color="muted" className="flex-1">
                Society announcements and official updates.
              </Typography.Paragraph>
            ) : (
              <View className="flex-1" />
            )}

            {isAdmin ? (
              <Button onPress={() => router.push("/(stack)/notice-create")}>
                <Lucide name="plus" size={18} color="white" />
                <Button.Label>Add Notice</Button.Label>
              </Button>
            ) : null}
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
                    onPress={() =>
                      router.push({
                        pathname: "/(stack)/notice-create",
                        params: {
                          id: item._id,
                          title: item.title,
                          description: item.description,
                          tag: item.tag,
                        },
                      })
                    }
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
