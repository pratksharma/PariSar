import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import {
  BottomSheet,
  Button,
  Card,
  Chip,
  Input,
  Label,
  Separator,
  Spinner,
  TextArea,
  Typography,
  useToast,
} from "heroui-native";
import Lucide from "@react-native-vector-icons/lucide";

import { useAuthStore } from "@/stores/authStore";
import { useComplaintStore, type ComplaintStatus } from "@/stores/complaintStore";
import { BottomSheetInput, BottomSheetTextArea } from "@/components/ui/BottomSheetInputs";

export default function Complaints() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  const complaints = useComplaintStore((state) => state.complaints);
  const loading = useComplaintStore((state) => state.loading);
  const getComplaints = useComplaintStore((state) => state.getComplaints);
  const createComplaint = useComplaintStore((state) => state.createComplaint);
  const updateComplaintStatus = useComplaintStore((state) => state.updateComplaintStatus);

  const { toast } = useToast();

  const [refreshing, setRefreshing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

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

  const submitComplaint = async () => {
    if (!title.trim() || !description.trim()) {
      toast.show({
        variant: "danger",
        label: "Validation Error",
        description: "Please provide both title and description.",
      });
      return;
    }

    try {
      await createComplaint({
        title: title.trim(),
        description: description.trim(),
      });

      setTitle("");
      setDescription("");
      setIsOpen(false);

      toast.show({
        variant: "success",
        label: "Complaint Submitted",
        description: "Your complaint has been submitted to society management.",
      });
    } catch (err: any) {
      toast.show({
        variant: "danger",
        label: "Submission Failed",
        description: err?.response?.data?.message ?? "Could not submit complaint.",
      });
    }
  };

  if (loading && complaints.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
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
        <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen}>
          <View className="flex-row items-center justify-between gap-3">
            <Typography.Paragraph color="muted" className="flex-1">
              {isAdmin
                ? "Review and resolve resident complaints."
                : "Raise and track society maintenance complaints."}
            </Typography.Paragraph>

            {!isAdmin ? (
              <BottomSheet.Trigger asChild>
                <Button>
                  <Lucide name="plus" size={18} color="white" />
                  <Button.Label>Raise Issue</Button.Label>
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
                    <Typography.Heading type="h3">Raise Complaint</Typography.Heading>
                  </BottomSheet.Title>
                  <BottomSheet.Description>
                    Describe the issue clearly so society management can review and resolve it.
                  </BottomSheet.Description>
                </View>

                <View className="gap-1.5">
                  <Label>Title</Label>
                  <BottomSheetInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="e.g. Water Leakage in Tower A"
                    className="bg-background-secondary"
                    returnKeyType="next"
                  />
                </View>

                <View className="gap-1.5">
                  <Label>Description</Label>
                  <BottomSheetTextArea
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Explain the problem in detail"
                    numberOfLines={4}
                    className="bg-background-secondary"
                  />
                </View>

                <View className="gap-3 mt-3">
                  <Button onPress={submitComplaint}>
                    <Button.Label>Submit Complaint</Button.Label>
                  </Button>
                  <Button variant="tertiary" onPress={() => setIsOpen(false)}>
                    <Button.Label>Cancel</Button.Label>
                  </Button>
                </View>
              </ScrollView>
            </BottomSheet.Content>
          </BottomSheet.Portal>
        </BottomSheet>

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
