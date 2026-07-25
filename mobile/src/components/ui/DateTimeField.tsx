import { useMemo, useState } from "react";
import { Platform, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Button, Label, TextField, Typography } from "heroui-native";

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

function formatDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatTime(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

interface DateTimeFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  mode: "date" | "time";
  placeholder?: string;
  isRequired?: boolean;
}

export default function DateTimeField({
  label,
  value,
  onChange,
  mode,
  placeholder,
  isRequired,
}: DateTimeFieldProps) {
  const [open, setOpen] = useState(false);

  const dateValue = useMemo(() => {
    if (!value) return new Date();

    if (mode === "date") {
      return new Date(`${value}T00:00:00`);
    }

    const [hours, minutes] = value.split(":").map((part) => Number(part));
    const next = new Date();
    if (!Number.isNaN(hours)) next.setHours(hours);
    if (!Number.isNaN(minutes)) next.setMinutes(minutes);
    next.setSeconds(0, 0);
    return next;
  }, [mode, value]);

  return (
    <TextField isRequired={isRequired}>
      <Label>{label}</Label>

      <Button variant="secondary" onPress={() => setOpen(true)} className="justify-start">
        <Button.Label>
          {value || placeholder || (mode === "date" ? "Select date" : "Select time")}
        </Button.Label>
      </Button>

      {open ? (
        <View className="items-start">
          <DateTimePicker
            value={dateValue}
            mode={mode}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onValueChange={(_, selected) => {
              if (!selected) return;

              onChange(mode === "date" ? formatDate(selected) : formatTime(selected));

              if (Platform.OS !== "ios") {
                setOpen(false);
              }
            }}
            onDismiss={() => setOpen(false)}
          />

          {Platform.OS === "ios" ? (
            <Button variant="secondary" onPress={() => setOpen(false)}>
              <Button.Label>Done</Button.Label>
            </Button>
          ) : null}
        </View>
      ) : null}

      <Typography.Paragraph color="muted" type="body-sm">
        {value ? `Selected: ${value}` : ""}
      </Typography.Paragraph>
    </TextField>
  );
}
