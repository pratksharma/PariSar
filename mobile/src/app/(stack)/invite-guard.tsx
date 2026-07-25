import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Input, Label, TextField, Typography, useToast } from "heroui-native";
import Lucide from "@react-native-vector-icons/lucide";

import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useSocietyStore } from "@/stores/societyStore";

export default function InviteGuard() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name.trim() || !phone.trim()) return;

    setLoading(true);
    try {
      const { data } = await api.post("/society/invite-guard", {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
      });

      toast.show({
        variant: "success",
        label: "Invite created",
        description: `Invite code: ${data.invitation.inviteCode}`,
      });

      await useSocietyStore.getState().getGuardInvitations();

      router.back();
    } catch (error: any) {
      toast.show({
        variant: "danger",
        label: "Invite failed",
        description: error?.response?.data?.message ?? "Could not create invite.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== "admin") {
    return (
      <View className="flex-1 items-center justify-center px-4">
        <Typography.Heading type="h4">Only admins can invite guards.</Typography.Heading>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="px-4 pt-28 pb-8 gap-5"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-2">
          <Typography.Paragraph color="muted">
            Create an invitation for a guard who will join your society using their phone number.
          </Typography.Paragraph>
        </View>

        <View className="gap-4">
          <TextField>
            <Label>Name</Label>
            <Input value={name} onChangeText={setName} placeholder="Guard name" />
          </TextField>

          <TextField>
            <Label>Phone</Label>
            <Input
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="Guard phone"
            />
          </TextField>

          <TextField>
            <Label>Email</Label>
            <Input
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="Optional email"
            />
          </TextField>

          <Button onPress={submit} isDisabled={loading}>
            <Lucide name="shield-plus" size={18} color="white" />
            <Button.Label>{loading ? "Creating..." : "Create Invite"}</Button.Label>
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
