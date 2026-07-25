import type { ComponentProps } from "react";
import { Input, TextArea, useBottomSheetAwareHandlers } from "heroui-native";

export function BottomSheetInput({
  onFocus: externalOnFocus,
  onBlur: externalOnBlur,
  ...props
}: ComponentProps<typeof Input>) {
  const { onFocus, onBlur } = useBottomSheetAwareHandlers();

  return (
    <Input
      {...props}
      onFocus={(e) => {
        onFocus(e);
        externalOnFocus?.(e);
      }}
      onBlur={(e) => {
        onBlur(e);
        externalOnBlur?.(e);
      }}
    />
  );
}

export function BottomSheetTextArea({
  onFocus: externalOnFocus,
  onBlur: externalOnBlur,
  ...props
}: ComponentProps<typeof TextArea>) {
  const { onFocus, onBlur } = useBottomSheetAwareHandlers();

  return (
    <TextArea
      {...props}
      onFocus={(e) => {
        onFocus(e);
        externalOnFocus?.(e);
      }}
      onBlur={(e) => {
        onBlur(e);
        externalOnBlur?.(e);
      }}
    />
  );
}
