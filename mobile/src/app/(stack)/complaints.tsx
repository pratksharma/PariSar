import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import {
  Button,
  Card,
  Chip,
  Separator,
  Spinner,
  Typography,
} from "heroui-native";
import Lucide from "@react-native-vector-icons/lucide";

import { useAuthStore } from "@/stores/authStore";
import { useComplaintStore, type ComplaintStatus } from "@/stores/complaintStore";

export default function Complaints() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";
  const isResident = user?.role === "resident";

  const complaints = useComplaintStore((state) => state.complaints);
  const loading = useComplaintStore((state) => state.loading);
  const getComplaints = useComplaintStore((state) => state.getComplaints);
  const updateComplaintStatus = useComplaintStore((state) => state.updateComplaintStatus);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getComplaints().catch(() => undefined);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await getComplaints();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading && complaints.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Spinner />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pt-28 pb-28 gap-5"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between gap-3">
          <Typography.Paragraph color="muted" className="flex-1">
            {isAdmin
              ? "Review and resolve resident complaints."
              : "Raise and track society maintenance complaints."}
          </Typography.Paragraph>

          {isResident ? (
            <Button onPress={() => router.push("/(stack)/complaint-create")}>
              <Lucide name="plus" size={18} color="white" />
              <Button.Label>Raise Issue</Button.Label>
            </Button>
          ) : null}
        </View>

        {isAdmin ? (
          <View className="gap-3">
            {complaints.map((complaint) => (
              <Card key={complaint._id}>
                <Card.Body className="gap-3">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1 gap-1">
                      <Typography.Heading type="h5">{complaint.title}</Typography.Heading>
                      <Typography.Paragraph color="muted">
                        {complaint.description}
                      </Typography.Paragraph>
                    </View>

                    <Chip
                      variant="secondary"
                      color={complaint.status === "resolved" ? "success" : "default"}
                    >
                      <Chip.Label className="uppercase">{complaint.status}</Chip.Label>
                    </Chip>
                  </View>

                  <Separator />

                  <Typography.Paragraph type="body-sm" color="muted">
                    Submitted on {new Date(complaint.createdAt).toLocaleString()}
                  </Typography.Paragraph>

                  <View className="flex-row flex-wrap gap-2">
                    {(["open", "resolved"] as ComplaintStatus[]).map((status) => (
                      <Button
                        key={status}
                        variant={complaint.status === status ? "primary" : "secondary"}
                        onPress={async () => {
                          await updateComplaintStatus(complaint._id, status);
                        }}
                      >
                        <Button.Label className="capitalize">{status}</Button.Label>
                      </Button>
                    ))}
                  </View>
                </Card.Body>
              </Card>
            ))}

            {!complaints.length ? (
              <View className="items-center justify-center py-12">
                <Typography.Heading type="h4" className="font-medium">
                  No Complaints Yet
                </Typography.Heading>
                <Typography.Paragraph color="muted" className="text-center mt-1">
                  Complaints submitted by residents will appear here.
                </Typography.Paragraph>
              </View>
            ) : null}
          </View>
        ) : (
          <View className="gap-3">
            {complaints.map((complaint) => (
              <Card key={complaint._id}>
                <Card.Body className="gap-3">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1 gap-1">
                      <Typography.Heading type="h5">{complaint.title}</Typography.Heading>
                      <Typography.Paragraph color="muted">
                        {complaint.description}
                      </Typography.Paragraph>
                    </View>

                    <Chip
                      variant="secondary"
                      color={complaint.status === "resolved" ? "success" : "default"}
                    >
                      <Chip.Label className="uppercase">{complaint.status}</Chip.Label>
                    </Chip>
                  </View>

                  <Separator />

                  <Typography.Paragraph type="body-sm" color="muted">
                    Submitted on {new Date(complaint.createdAt).toLocaleString()}
                  </Typography.Paragraph>
                </Card.Body>
              </Card>
            ))}

            {!complaints.length ? (
              <View className="items-center justify-center py-12">
                <Typography.Heading type="h4" className="font-medium">
                  No Complaints Raised
                </Typography.Heading>
                <Typography.Paragraph color="muted" className="text-center mt-1">
                  Tap "Raise Issue" to report a maintenance or society complaint.
                </Typography.Paragraph>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
