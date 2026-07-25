import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  Button,
  FieldError,
  Input,
  Label,
  Spinner,
  TextField,
  Typography,
  useThemeColor,
  useToast,
} from "heroui-native";
import { FadeIn } from "react-native-reanimated";
import { useAmenitiesStore } from "@/stores/amenitiesStore";
import Lucide from "@react-native-vector-icons/lucide";
import DateTimeField from "@/components/ui/DateTimeField";

export default function BookAmenity() {
  const { amenityId } = useLocalSearchParams<{ amenityId: string }>();

  const bookAmenity = useAmenitiesStore((s) => s.bookAmenity);
  const loading = useAmenitiesStore((s) => s.loading);

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [errors, setErrors] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });

  const { toast } = useToast();
  const [success, danger, background] = useThemeColor(["success", "danger", "background"]);

  const validate = () => {
    const newErrors = {
      date: "",
      startTime: "",
      endTime: "",
    };

    if (!date.trim()) newErrors.date = "Date is required.";
    if (!startTime.trim()) newErrors.startTime = "Start time is required.";
    if (!endTime.trim()) newErrors.endTime = "End time is required.";

    setErrors(newErrors);

    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await bookAmenity({
        amenity: amenityId,
        date,
        startTime,
        endTime,
      });

      toast.show({
        variant: "success",
        label: "Booking requested",
        description: "Your amenity booking request has been submitted.",
        icon: <Lucide name="check-circle-2" size={24} color={success} />,
      });
    } catch (err: any) {
      toast.show({
        variant: "danger",
        label: "Booking failed",
        description: err?.response?.data?.message ?? err.message,
        icon: <Lucide name="circle-alert" size={24} color={danger} />,
      });
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="px-4 pt-28 pb-28 gap-4"
      >
        <Typography.Paragraph color="muted" className="text-center">
          Fill in the details below to request this amenity.
        </Typography.Paragraph>

        <View className="mt-4 gap-5">
          <DateTimeField label="Date" value={date} onChange={setDate} mode="date" isRequired />
          {errors.date ? <FieldError>{errors.date}</FieldError> : null}

          <DateTimeField
            label="Start Time"
            value={startTime}
            onChange={setStartTime}
            mode="time"
            isRequired
          />
          {errors.startTime ? <FieldError>{errors.startTime}</FieldError> : null}

          <DateTimeField
            label="End Time"
            value={endTime}
            onChange={setEndTime}
            mode="time"
            isRequired
          />
          {errors.endTime ? <FieldError>{errors.endTime}</FieldError> : null}

          <Button className="w-full mt-2" onPress={handleSubmit}>
            {loading ? (
              <Spinner entering={FadeIn.delay(50)} color={background} />
            ) : (
              <>
                <Lucide name="calendar-check-2" size={18} color="white" />
                <Button.Label>Book Amenity</Button.Label>
              </>
            )}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
