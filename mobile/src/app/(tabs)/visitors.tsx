import { useEffect, useRef, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Chip, Separator, Spinner, Typography, useThemeColor, useToast } from "heroui-native";
import Lucide from "@react-native-vector-icons/lucide";
import QRCode from "react-native-qrcode-svg";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import { useAuthStore } from "@/stores/authStore";
import { useVisitorStore, type VisitorEntry } from "@/stores/visitorStore";

const getResidentId = (entry: VisitorEntry) => {
  if (typeof entry.resident === "object" && entry.resident) {
    return entry.resident._id;
  }
  return entry.resident;
};

export default function Visitors() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isGuard = user?.role === "guard";
  const isAdmin = user?.role === "admin";
  const canManageGate = isGuard || isAdmin;

  const visitors = useVisitorStore((state) => state.visitors);
  const loading = useVisitorStore((state) => state.loading);
  const getVisitors = useVisitorStore((state) => state.getVisitors);
  const approveVisitor = useVisitorStore((state) => state.approveVisitor);
  const rejectVisitor = useVisitorStore((state) => state.rejectVisitor);
  const scanVisitorQr = useVisitorStore((state) => state.scanVisitorQr);
  const checkOutVisitor = useVisitorStore((state) => state.checkOutVisitor);

  const [refreshing, setRefreshing] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedOnce, setScannedOnce] = useState(false);
  const [qrOpenId, setQrOpenId] = useState<string | null>(null);

  const qrRefs = useRef<{ [key: string]: any }>({});
  const { toast } = useToast();

  const [accentHover] = useThemeColor(['accent-hover']);

  useEffect(() => {
    getVisitors().catch(() => undefined);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await getVisitors();
    } finally {
      setRefreshing(false);
    }
  };

  const handleBarcode = async ({ data }: { data: string }) => {
    if (scannedOnce) return;

    try {
      setScannedOnce(true);
      let qrToken = data;

      try {
        const parsed = JSON.parse(data);
        if (parsed?.qrToken) {
          qrToken = parsed.qrToken;
        }
      } catch {
        // Raw token fallback
      }

      await scanVisitorQr(qrToken);
      await getVisitors();

      toast.show({
        variant: "success",
        label: "Visitor Checked In",
        description: "The visitor entry was marked successfully.",
      });
      setScanning(false);
    } catch (error: any) {
      toast.show({
        variant: "danger",
        label: "Scan Failed",
        description: error?.response?.data?.message ?? "Invalid or already used QR code.",
      });
    } finally {
      setTimeout(() => setScannedOnce(false), 2000);
    }
  };

  const handleApprove = async (entryId: string) => {
    try {
      await approveVisitor(entryId);
      toast.show({
        variant: "success",
        label: "Visitor Approved",
        description: "Entry pass approved.",
      });
    } catch (err: any) {
      toast.show({
        variant: "danger",
        label: "Approval failed",
        description: err?.response?.data?.message ?? "Could not approve visitor.",
      });
    }
  };

  const handleReject = async (entryId: string) => {
    try {
      await rejectVisitor(entryId);
      toast.show({
        variant: "success",
        label: "Visitor Rejected",
        description: "Entry pass rejected.",
      });
    } catch (err: any) {
      toast.show({
        variant: "danger",
        label: "Action failed",
        description: err?.response?.data?.message ?? "Could not reject visitor.",
      });
    }
  };

  const handleCheckOut = async (entryId: string) => {
    try {
      await checkOutVisitor(entryId);
      await getVisitors();
      toast.show({
        variant: "success",
        label: "Visitor Checked Out",
        description: "Exit time recorded.",
      });
    } catch (err: any) {
      toast.show({
        variant: "danger",
        label: "Action failed",
        description: err?.response?.data?.message ?? "Could not mark visitor exit.",
      });
    }
  };

  const handleShareQrImage = async (entry: VisitorEntry) => {
    const ref = qrRefs.current[entry._id];
    if (!ref) {
      toast.show({
        variant: "danger",
        label: "Share Failed",
        description: "QR Code image not ready.",
      });
      return;
    }

    try {
      ref.toDataURL(async (dataURL: string) => {
        const fileUri = `${FileSystem.cacheDirectory}qr_${entry._id}.png`;
        await FileSystem.writeAsStringAsync(fileUri, dataURL, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: "image/png",
            dialogTitle: `Visitor Pass - ${entry.visitor?.name}`,
          });
        } else {
          toast.show({
            variant: "danger",
            label: "Sharing Unavailable",
            description: "Sharing is not supported on this device.",
          });
        }
      });
    } catch (err: any) {
      toast.show({
        variant: "danger",
        label: "Share Error",
        description: "Could not share QR image.",
      });
    }
  };

  if (loading && visitors.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <Spinner />
      </View>
    );
  }

  // Camera QR Code Scanner - Guard ONLY
  if (isGuard && scanning) {
    return (
      <View className="flex-1 bg-background py-50 px-4">
        <CameraView
          style={{ flex: 1, borderRadius: 16 }}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={handleBarcode}
        />

        <View className="px-4 mt-4">
          <Button variant="secondary" onPress={() => setScanning(false)}>
            <Lucide name="x" size={18} color={accentHover} />
            <Button.Label>Close Scanner</Button.Label>
          </Button>
        </View>
      </View>
    );
  }

  if (isGuard && permission && !permission.granted) {
    return (
      <View className="flex-1 items-center justify-center gap-4 px-4">
        <Typography.Heading type="h4">Camera access required</Typography.Heading>
        <Button onPress={requestPermission}>
          <Button.Label>Allow Camera</Button.Label>
        </Button>
      </View>
    );
  }

  // Filter visitors by ownership
  const myVisitors = visitors.filter((e) => getResidentId(e) === user?._id);
  const societyVisitors = visitors.filter((e) => getResidentId(e) !== user?._id);

  const renderVisitorItem = (entry: VisitorEntry, isOwner: boolean) => {
    // Show QR pass ONLY if entry is approved AND not yet marked as checked_in/used
    const canShowQr = isOwner && entry.status === "approved" && !entry.qrUsed;

    return (
      <View key={entry._id} className="gap-2">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 gap-1">
            <Typography.Heading type="h5">{entry.visitor?.name}</Typography.Heading>
            <Typography.Paragraph color="muted">
              {entry.purpose} • {entry.tower}-{entry.flatNumber}
            </Typography.Paragraph>
          </View>
          <Chip
            variant="secondary"
            color={
              entry.status === "approved"
                ? "success"
                : entry.status === "pending"
                  ? "warning"
                  : entry.status === "checked_in"
                    ? "accent"
                    : "default"
            }
          >
            <Chip.Label className="uppercase">{entry.status}</Chip.Label>
          </Chip>
        </View>

        {/* Pending approval actions */}
        {entry.status === "pending" && (!isGuard || isAdmin) ? (
          <View className="flex-row gap-2 mt-1">
            <Button
              className="flex-1"
              onPress={() => handleApprove(entry._id)}
            >
              <Lucide name="check" size={16} color="white" />
              <Button.Label>Approve</Button.Label>
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onPress={() => handleReject(entry._id)}
            >
              <Lucide name="x" size={16} color="white" />
              <Button.Label>Reject</Button.Label>
            </Button>
          </View>
        ) : null}

        {/* QR Code pass view - Only rendered if entry is approved & NOT YET marked */}
        {canShowQr && entry.qrToken ? (
          <View className="gap-3 rounded-2xl bg-background-secondary p-4">
            <View className="flex-row items-center justify-between gap-3">
              <Typography.Paragraph className="flex-1 font-medium">
                Ready for check-in
              </Typography.Paragraph>

              <Button
                variant="secondary"
                onPress={() => setQrOpenId(qrOpenId === entry._id ? null : entry._id)}
              >
                <Button.Label>{qrOpenId === entry._id ? "Hide QR" : "Show QR"}</Button.Label>
              </Button>
            </View>

            {qrOpenId === entry._id ? (
              <View className="items-center gap-3">
                <QRCode
                  getRef={(c) => (qrRefs.current[entry._id] = c)}
                  value={JSON.stringify({ entryId: entry._id, qrToken: entry.qrToken })}
                  size={180}
                />
                <Button
                  variant="secondary"
                  onPress={() => handleShareQrImage(entry)}
                >
                  <Lucide name="share-2" size={18} />
                  <Button.Label>Share QR Image</Button.Label>
                </Button>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Mark Exit button for checked_in visitors */}
        {canManageGate && entry.status === "checked_in" ? (
          <Button variant="secondary" onPress={() => handleCheckOut(entry._id)}>
            <Lucide name="log-out" size={16} />
            <Button.Label>Mark Exit</Button.Label>
          </Button>
        ) : null}

        <Separator />
      </View>
    );
  };

  const hasAnyVisitors = visitors.length > 0;

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="px-4 pt-28 pb-28 gap-5"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header Controls (No Screen Title, since Navigation Header shows title) */}
      <View className="flex-row items-center justify-between gap-3">
        <Typography.Paragraph color="muted" className="flex-1">
          {isGuard
            ? "Log gate entries, scan QR codes, and mark exits."
            : "View visitor history and pre-approve guests."}
        </Typography.Paragraph>

        <Button onPress={() => router.push("/(stack)/visitor-create")}>
          <Lucide name="plus" size={18} color="white" />
          <Button.Label>Add Visitor</Button.Label>
        </Button>
      </View>

      {/* QR Scanner option ONLY visible to Guards */}
      {isGuard ? (
        <Button
          onPress={async () => {
            if (!permission?.granted) {
              const next = await requestPermission();
              if (!next.granted) return;
            }
            setScanning(true);
          }}
        >
          <Lucide name="scan-line" size={18} color="white" />
          <Button.Label>Open QR Scanner</Button.Label>
        </Button>
      ) : null}

      {!hasAnyVisitors ? (
        <View className="flex-1 items-center justify-center py-12">
          <Typography.Heading type="h4" className="font-medium">
            No Visitors Yet
          </Typography.Heading>
          <Typography.Paragraph color="muted" className="text-center mt-1">
            {isGuard
              ? "No visitor entries have been logged at the gate."
              : "Tap 'Add Visitor' to pre-approve a guest or delivery."}
          </Typography.Paragraph>
        </View>
      ) : isAdmin ? (
        /* ADMIN VIEW: My Visitors + Society Visitors */
        <View className="gap-5">
          {myVisitors.length > 0 && (
            <Card>
              <Card.Body className="gap-3">
                <Card.Title>My Visitors</Card.Title>
                {myVisitors.map((entry) => renderVisitorItem(entry, true))}
              </Card.Body>
            </Card>
          )}

          <Card>
            <Card.Body className="gap-3">
              <Card.Title>Society Visitors</Card.Title>
              {societyVisitors.map((entry) => renderVisitorItem(entry, false))}
              {!societyVisitors.length ? (
                <Typography.Paragraph color="muted">
                  No other society visitor records yet.
                </Typography.Paragraph>
              ) : null}
            </Card.Body>
          </Card>
        </View>
      ) : isGuard ? (
        /* GUARD VIEW */
        <Card>
          <Card.Body className="gap-3">
            <Card.Title>Recent Entries</Card.Title>
            {visitors.map((entry) => renderVisitorItem(entry, false))}
          </Card.Body>
        </Card>
      ) : (
        /* RESIDENT VIEW */
        <Card>
          <Card.Body className="gap-3">
            <Card.Title>My Visitors</Card.Title>
            {myVisitors.map((entry) => renderVisitorItem(entry, true))}
            {!myVisitors.length ? (
              <Typography.Paragraph color="muted">
                No visitor passes created yet.
              </Typography.Paragraph>
            ) : null}
          </Card.Body>
        </Card>
      )}
    </ScrollView>
  );
}
