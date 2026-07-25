import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { Button, Input, Label, TextArea, TextField, Typography, useToast } from "heroui-native";
import Lucide from "@react-native-vector-icons/lucide";

import DateTimeField from "@/components/ui/DateTimeField";
import { useAuthStore } from "@/stores/authStore";
import { useVisitorStore } from "@/stores/visitorStore";

const visitorTypes = [
  "Guest",
  "Delivery",
  "Cab",
  "Maid",
  "Cook",
  "Driver",
  "Technician",
  "Other",
] as const;

function toLowerType(value: string) {
  return value.toLowerCase();
}

export default function VisitorCreate() {
  const router = useRouter();
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const createVisitor = useVisitorStore((state) => state.createVisitor);
  const createPreApprovedVisitor = useVisitorStore((state) => state.createPreApprovedVisitor);
  const loading = useVisitorStore((state) => state.loading);

  const isGuard = user?.role === "guard";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [purpose, setPurpose] = useState("");
  const [type, setType] = useState<(typeof visitorTypes)[number]>("Guest");
  const [remarks, setRemarks] = useState("");
  const [tower, setTower] = useState(user?.tower ?? "");
  const [flatNumber, setFlatNumber] = useState(user?.flatNumber ?? "");
  const [expectedDate, setExpectedDate] = useState("");
  const [expectedTime, setExpectedTime] = useState("");

  const submit = async () => {
    if (!name.trim() || !phone.trim() || !purpose.trim()) {
      toast.show({
        variant: "danger",
        label: "Required Fields Missing",
        description: "Please provide Name, Phone number, and Purpose.",
      });
      return;
    }

    const expectedAt =
      expectedDate && expectedTime
        ? new Date(`${expectedDate}T${expectedTime}:00`).toISOString()
        : undefined;

    try {
      if (isGuard) {
        if (!tower.trim() || !flatNumber.trim()) {
          toast.show({
            variant: "danger",
            label: "Tower and Flat Required",
            description: "Please specify the destination Tower and Flat number.",
          });
          return;
        }

        await createVisitor({
          name: name.trim(),
          phone: phone.trim(),
          vehicleNumber: vehicleNumber.trim() || undefined,
          purpose: purpose.trim(),
          type: toLowerType(type),
          tower: tower.trim(),
          flatNumber: flatNumber.trim(),
          remarks: remarks.trim() || undefined,
        });
      } else {
        await createPreApprovedVisitor({
          name: name.trim(),
          phone: phone.trim(),
          vehicleNumber: vehicleNumber.trim() || undefined,
          purpose: purpose.trim(),
          type: toLowerType(type),
          tower: tower.trim() || undefined,
          flatNumber: flatNumber.trim() || undefined,
          remarks: remarks.trim() || undefined,
          expectedAt,
        });
      }

      toast.show({
        variant: "success",
        label: isGuard ? "Visitor Created" : "Visitor Pre-Approved",
        description: isGuard
          ? "The entry record was added successfully."
          : "The visitor pass is ready to share.",
      });

      router.back();
    } catch (error: any) {
      toast.show({
        variant: "danger",
        label: "Could not create visitor",
        description: error?.response?.data?.message ?? "Please try again.",
      });
    }
  };

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
            {isGuard
              ? "Record a new visitor arrival at the security gate."
              : "Generate an advance visitor pass for your guest."}
          </Typography.Paragraph>
        </View>

        <View className="gap-4">
          <TextField>
            <Label>Name</Label>
            <Input value={name} onChangeText={setName} placeholder="Visitor name" />
          </TextField>

          <TextField>
            <Label>Phone</Label>
            <Input
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="Visitor phone"
            />
          </TextField>

          <TextField>
            <Label>Vehicle Number</Label>
            <Input value={vehicleNumber} onChangeText={setVehicleNumber} placeholder="Optional" />
          </TextField>

          {isGuard && (
            <>
              <TextField>
                <Label>Tower</Label>
                <Input value={tower} onChangeText={setTower} placeholder="Tower (e.g. A)" />
              </TextField>

              <TextField>
                <Label>Flat Number</Label>
                <Input value={flatNumber} onChangeText={setFlatNumber} placeholder="Flat (e.g. 101)" />
              </TextField>
            </>
          )}

          {!isGuard && (
            <>
              <DateTimeField
                label="Expected Date"
                value={expectedDate}
                onChange={setExpectedDate}
                mode="date"
                placeholder="Select date"
              />

              <DateTimeField
                label="Expected Time"
                value={expectedTime}
                onChange={setExpectedTime}
                mode="time"
                placeholder="Select time"
              />
            </>
          )}

          <TextField>
            <Label>Purpose</Label>
            <Input value={purpose} onChangeText={setPurpose} placeholder="Delivery, guest, etc." />
          </TextField>

          <TextField>
            <Label>Type</Label>
            <View className="overflow-hidden rounded-2xl border border-outline">
              <Picker selectedValue={type} onValueChange={(value) => setType(value)}>
                {visitorTypes.map((item) => (
                  <Picker.Item key={item} label={item} value={item} />
                ))}
              </Picker>
            </View>
          </TextField>

          <TextField>
            <Label>Remarks</Label>
            <TextArea value={remarks} onChangeText={setRemarks} placeholder="Optional remarks" />
          </TextField>

          <Button onPress={submit} isDisabled={loading}>
            <Lucide name="plus" size={18} color="white" />
            <Button.Label>{loading ? "Creating..." : "Create Visitor"}</Button.Label>
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
