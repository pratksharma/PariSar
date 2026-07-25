import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { Button, Card, Chip, Separator, Typography, useToast } from "heroui-native";
import Lucide from "@react-native-vector-icons/lucide";

import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useSocietyStore } from "@/stores/societyStore";

const Society = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const getUser = useAuthStore((state) => state.getUser);
  const society = user?.society;
  const isAdmin = user?.role === "admin";
  const { toast } = useToast();

  const [refreshing, setRefreshing] = useState(false);

  const guardInvitations = useSocietyStore((state) => state.guardInvitations);
  const pendingRequests = useSocietyStore((state) => state.pendingRequests);
  const getMySociety = useSocietyStore((state) => state.getMySociety);
  const getGuardInvitations = useSocietyStore((state) => state.getGuardInvitations);
  const getPendingRequests = useSocietyStore((state) => state.getPendingRequests);

  useEffect(() => {
    if (!society) {
      getMySociety().catch(() => undefined);
      return;
    }

    if (isAdmin) {
      Promise.all([getGuardInvitations(), getPendingRequests()]).catch(() => undefined);
    }
  }, [society, isAdmin, getGuardInvitations, getPendingRequests, getMySociety]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const requests = [getUser(), getMySociety()];
      if (isAdmin) {
        requests.push(getGuardInvitations(), getPendingRequests());
      }
      await Promise.all(requests);
    } finally {
      setRefreshing(false);
    }
  };

  if (!society) {
    return (
      <View className="flex-1 items-center justify-center px-4 py-25">
        <Typography.Paragraph color="muted" className="text-center">
          No society details are available for this account.
        </Typography.Paragraph>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="px-4 pt-28 pb-28 gap-5"
      showsVerticalScrollIndicator={false}
    >
      <Card>
        <Card.Body className="gap-4">
          <View className="gap-2">
            <Chip variant="secondary" color={isAdmin ? "success" : "default"}>
              <Chip.Label className="uppercase">{user?.role ?? "member"}</Chip.Label>
            </Chip>
            <Typography.Heading type="h3">{society.name}</Typography.Heading>
            <Typography.Paragraph color="muted">{society.address}</Typography.Paragraph>
          </View>

          <Separator />

          <View className="flex-row flex-wrap gap-2">
            <Chip variant="secondary">
              <Lucide name="hash" size={14} />
              <Chip.Label>{society.uniqueCode}</Chip.Label>
            </Chip>
            <Chip variant="secondary">
              <Lucide name="users" size={14} />
              <Chip.Label>{society.totalResidents ?? 0} Residents</Chip.Label>
            </Chip>
            <Chip variant="secondary">
              <Lucide name="shield" size={14} />
              <Chip.Label>{society.totalGuards ?? 0} Guards</Chip.Label>
            </Chip>
          </View>
        </Card.Body>
      </Card>

      {society.description ? (
        <Card>
          <Card.Body className="gap-3">
            <Card.Title>Description</Card.Title>
            <Typography.Paragraph>{society.description}</Typography.Paragraph>
          </Card.Body>
        </Card>
      ) : null}

      {society.admin && typeof society.admin !== "string" ? (
        <Card>
          <Card.Body className="gap-3">
            <Card.Title>Administrator</Card.Title>
            <Typography.Paragraph>{society.admin.name}</Typography.Paragraph>
            <Typography.Paragraph color="muted">{society.admin.email}</Typography.Paragraph>
            {society.admin.phone ? (
              <Typography.Paragraph color="muted">{society.admin.phone}</Typography.Paragraph>
            ) : null}
          </Card.Body>
        </Card>
      ) : null}

      {isAdmin ? (
        <Card>
          <Card.Body className="gap-4">
            <Card.Title>Guard Invitations</Card.Title>

            <Button variant="secondary" onPress={() => router.push("/(stack)/invite-guard")}>
              <Lucide name="shield-plus" size={18} />
              <Button.Label>Invite Guard</Button.Label>
            </Button>

            <View className="gap-3">
              {guardInvitations.map((invitation) => (
                <Card key={invitation._id}>
                  <Card.Body className="gap-3">
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1 gap-1">
                        <Typography.Heading type="h5">{invitation.name}</Typography.Heading>
                        <Typography.Paragraph color="muted">
                          {invitation.phone}
                        </Typography.Paragraph>
                        {invitation.email ? (
                          <Typography.Paragraph color="muted">
                            {invitation.email}
                          </Typography.Paragraph>
                        ) : null}
                      </View>
                      <Chip variant="secondary" color={invitation.accepted ? "success" : "default"}>
                        <Chip.Label className="uppercase">
                          {invitation.accepted ? "used" : "active"}
                        </Chip.Label>
                      </Chip>
                    </View>

                    <View className="flex-row items-center justify-between gap-3">
                      <Typography.Paragraph className="font-medium">
                        {invitation.inviteCode}
                      </Typography.Paragraph>
                      <Button
                        variant="secondary"
                        isIconOnly
                        onPress={async () => {
                          await Clipboard.setStringAsync(invitation.inviteCode);
                          toast.show({
                            variant: "default",
                            label: "Copied",
                            description: "Invite code copied to clipboard.",
                          });
                        }}
                      >
                        <Lucide name="copy" size={18} />
                      </Button>
                    </View>

                    <Typography.Paragraph color="muted" type="body-sm">
                      Expires {new Date(invitation.expiresAt).toLocaleString()}
                    </Typography.Paragraph>
                  </Card.Body>
                </Card>
              ))}

              {!guardInvitations.length ? (
                <Typography.Paragraph color="muted">No guard invitations yet.</Typography.Paragraph>
              ) : null}
            </View>
          </Card.Body>
        </Card>
      ) : null}

      {isAdmin ? (
        <Card>
          <Card.Body className="gap-4">
            <Card.Title>Resident Approval Requests</Card.Title>

            <View className="gap-3">
              {pendingRequests.map((request) => (
                <Card key={request._id}>
                  <Card.Body className="gap-3">
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1 gap-1">
                        <Typography.Heading type="h5">{request.name}</Typography.Heading>
                        <Typography.Paragraph color="muted">
                          {request.tower} • {request.flatNumber}
                        </Typography.Paragraph>
                      </View>
                      <Chip variant="secondary">PENDING</Chip>
                    </View>

                    <View className="flex-row gap-2">
                      <Button
                        className="flex-1"
                        onPress={async () => {
                          await api.patch(`/society/approve/${request._id}`);
                          await Promise.all([getUser(), getMySociety(), getPendingRequests()]);
                          toast.show({ variant: "success", label: "Resident approved" });
                        }}
                      >
                        <Lucide name="check" size={16} color="white" />
                        <Button.Label>Approve</Button.Label>
                      </Button>

                      <Button
                        variant="danger"
                        className="flex-1"
                        onPress={async () => {
                          await api.patch(`/society/reject/${request._id}`);
                          await Promise.all([getUser(), getMySociety(), getPendingRequests()]);
                          toast.show({ variant: "default", label: "Resident rejected" });
                        }}
                      >
                        <Lucide name="x" size={16} color="white" />
                        <Button.Label>Reject</Button.Label>
                      </Button>
                    </View>
                  </Card.Body>
                </Card>
              ))}

              {!pendingRequests.length ? (
                <Typography.Paragraph color="muted">
                  No pending residents right now.
                </Typography.Paragraph>
              ) : null}
            </View>
          </Card.Body>
        </Card>
      ) : null}

      <Button variant="secondary" onPress={refresh}>
        <Lucide name="refresh-cw" size={18} />
        <Button.Label>{refreshing ? "Refreshing..." : "Refresh Society"}</Button.Label>
      </Button>
    </ScrollView>
  );
};

export default Society;
