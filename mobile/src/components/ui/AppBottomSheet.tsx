import type { ReactNode } from "react";
import { BottomSheet } from "heroui-native";

interface AppBottomSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export default function AppBottomSheet({
  isOpen,
  onOpenChange,
  children,
}: AppBottomSheetProps) {
  return (
    <BottomSheet isOpen={isOpen} onOpenChange={onOpenChange}>
      {children}
    </BottomSheet>
  );
}
