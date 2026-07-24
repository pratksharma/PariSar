import { useAuthStore } from "@/stores/authStore";
import { useNoticeStore } from "@/stores/noticeStore";
import Lucide from "@react-native-vector-icons/lucide";
import { useRouter } from "expo-router";
import { Card, Chip, PressableFeedback, Separator, Typography, useThemeColor } from "heroui-native";
import { useEffect, useState } from "react";
import { StyleSheet, Text, ScrollView, View } from "react-native";

const Home = () => {
  const user = useAuthStore((state) => state.user);
  const [muted, background] = useThemeColor(["muted", "background"]);
  const router = useRouter();

  const getNotices = useNoticeStore((state) => state.getNotices);
  const notices = useNoticeStore((state) => state.notices);

  useEffect(() => {
    getNotices();
  }, []);

  const latestNotice = notices[0];

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
      <View className="px-4 py-25 gap-6">
        {user?.society && (
          <View className="gap-2">
            <PressableFeedback
              className="overflow-auto"
              onPress={() => router.navigate("/(stack)/society")}
            >
              <Card className="gap-4">
                <Card.Header className="flex-row justify-between items-center">
                  <View className="h-14 w-14 items-center justify-center rounded-full bg-background-secondary">
                    <Lucide name="building-2" size={26} />
                  </View>
                  <Lucide name="chevron-right" size={20} />
                </Card.Header>

                <Card.Body>
                  <Typography.Heading type="h3" className="font-semibold">
                    {user.society.name}
                  </Typography.Heading>
                  <View className="flex-row items-center gap-2">
                    <Lucide name="map-pin" size={14} color={muted} />
                    <Typography.Paragraph color="muted">
                      {user.society.address}
                    </Typography.Paragraph>
                  </View>
                </Card.Body>

                <Separator />

                <Card.Footer className="flex-row flex-wrap gap-2">
                  <Chip variant="secondary" color="default">
                    <Lucide name="shield" size={14} />
                    <Chip.Label className="capitalize">{user.role}</Chip.Label>
                  </Chip>
                  <Chip variant="secondary" color="default">
                    <Lucide name="house" size={14} />
                    <Chip.Label>
                      {user.tower} • {user.flatNumber}
                    </Chip.Label>
                  </Chip>
                </Card.Footer>
              </Card>
            </PressableFeedback>
          </View>
        )}

        <View className="gap-2">
          <Typography.Heading type="h4" className="ml-2 font-medium">
            Quick Actions
          </Typography.Heading>
          <View className="gap-4">
            <View className="flex-row gap-4">
              <PressableFeedback
                className="flex-1 overflow-auto"
                onPress={() => router.navigate("/(stack)/complaints")}
              >
                <Card className="gap-4 bg-muted">
                  <Card.Header className="flex-row justify-between items-center">
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-background-secondary">
                      <Lucide name="file-exclamation-point" size={20} />
                    </View>
                    <Lucide name="chevron-right" size={20} color={background} />
                  </Card.Header>
                  <Card.Body>
                    <Card.Title>
                      <Typography.Heading type="h5" className="font-medium text-background">
                        Raise a Complaint
                      </Typography.Heading>
                    </Card.Title>
                  </Card.Body>
                </Card>
              </PressableFeedback>
              <PressableFeedback
                className="flex-1 overflow-auto"
                onPress={() => router.navigate("/(tabs)/visitors")}
              >
                <Card className="gap-4 bg-muted">
                  <Card.Header className="flex-row justify-between items-center">
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-background-secondary">
                      <Lucide name="user-plus" size={20} />
                    </View>
                    <Lucide name="chevron-right" size={20} color={background} />
                  </Card.Header>
                  <Card.Body>
                    <Card.Title>
                      <Typography.Heading type="h5" className="font-medium text-background">
                        Pre-approve Visitor
                      </Typography.Heading>
                    </Card.Title>
                  </Card.Body>
                </Card>
              </PressableFeedback>
            </View>
            <PressableFeedback
              className="flex-1 overflow-auto"
              onPress={() => router.navigate("/(stack)/amenities")}
            >
              <Card className="flex-row flex-1 items-center justify-between">
                <View className="flex-row gap-2 items-center">
                  <Card.Header className="h-10 w-10 items-center justify-center rounded-full bg-background-secondary">
                    <Lucide name="shapes" size={20} />
                  </Card.Header>
                  <Card.Body>
                    <Card.Title>
                      <Typography.Heading type="h5" className="font-medium">
                        Book Amenities
                      </Typography.Heading>
                    </Card.Title>
                  </Card.Body>
                </View>
                <Card.Footer>
                  <Lucide name="chevron-right" size={20} />
                </Card.Footer>
              </Card>
            </PressableFeedback>

            {!latestNotice && (
              <PressableFeedback
                className="flex-1 overflow-auto"
                onPress={() => router.navigate("/(tabs)/notices")}
              >
                <Card className="flex-row flex-1 items-center justify-between">
                  <View className="flex-row gap-2 items-center">
                    <Card.Header className="h-10 w-10 items-center justify-center rounded-full bg-background-secondary">
                      <Lucide name="clipboard-list" size={20} />
                    </Card.Header>
                    <Card.Body>
                      <Card.Title>
                        <Typography.Heading type="h5" className="font-medium">
                          Notices
                        </Typography.Heading>
                      </Card.Title>
                    </Card.Body>
                  </View>
                  <Card.Footer>
                    <Lucide name="chevron-right" size={20} />
                  </Card.Footer>
                </Card>
              </PressableFeedback>
            )}
          </View>
        </View>

        {latestNotice && (
          <View className="gap-2">
            <View className="flex-row items-center justify-between px-2">
              <Typography.Heading type="h4" className="font-medium">
                Latest Notice
              </Typography.Heading>

              <PressableFeedback
                onPress={() => router.navigate("/(tabs)/notices")}
                className="flex-row items-center gap-1"
              >
                <Typography.Paragraph color="default">View All</Typography.Paragraph>
                <Lucide name="chevron-right" size={18} />
              </PressableFeedback>
            </View>
            <Card className="gap-3">
              <Card.Header className="flex-row items-center justify-between">
                <Chip
                  variant="secondary"
                  color={latestNotice.tag == "emergency" ? "danger" : "default"}
                >
                  <Chip.Label className="capitalize">{latestNotice.tag}</Chip.Label>
                </Chip>
              </Card.Header>

              <Card.Body className="gap-2">
                <Typography.Heading type="h5" className="font-semibold">
                  {latestNotice.title}
                </Typography.Heading>

                <Typography.Paragraph numberOfLines={3}>
                  {latestNotice.description}
                </Typography.Paragraph>
              </Card.Body>
            </Card>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default Home;

const styles = StyleSheet.create({});
