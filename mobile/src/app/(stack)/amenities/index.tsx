import { useEffect } from "react";
import { Alert, FlatList, Image, View } from "react-native";
import { Button, Card, Chip, useThemeColor, useToast } from "heroui-native";
import { LinearGradient } from "expo-linear-gradient";
import Lucide from "@react-native-vector-icons/lucide";
import { useRouter } from "expo-router";

import { Amenity, useAmenitiesStore } from "@/stores/amenitiesStore";
import { useAuthStore } from "@/stores/authStore";

const Amenities = () => {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "admin";

  const amenities = useAmenitiesStore((s) => s.amenities);
  const bookings = useAmenitiesStore((s) => s.bookings);

  const getAmenities = useAmenitiesStore((s) => s.getAmenities);
  const getBookings = useAmenitiesStore((s) => s.getBookings);
  const approveBooking = useAmenitiesStore((s) => s.approveBooking);
  const rejectBooking = useAmenitiesStore((s) => s.rejectBooking);
  const cancelBooking = useAmenitiesStore((s) => s.cancelBooking);

  const { toast } = useToast();
  const [accentForeground] = useThemeColor(["accent-foreground"]);
  const router = useRouter();

  useEffect(() => {
    Promise.all([getAmenities(), getBookings()]);
  }, []);

  const handleBookAmenity = (amenity: Amenity) => {
    router.push({
      pathname: "/(stack)/amenities/book",
      params: {
        amenityId: amenity._id,
      },
    });
  };

  const handleApprove = async (bookingId: string) => {
    try {
      await approveBooking(bookingId);
      toast.show({
        variant: "success",
        label: "Booking Approved",
        description: "The booking request has been approved.",
      });
    } catch (err: any) {
      toast.show({
        variant: "danger",
        label: "Action Failed",
        description: err?.response?.data?.message ?? "Could not approve booking.",
      });
    }
  };

  const handleReject = async (bookingId: string) => {
    try {
      await rejectBooking(bookingId);
      toast.show({
        variant: "success",
        label: "Booking Rejected",
        description: "The booking request has been rejected.",
      });
    } catch (err: any) {
      toast.show({
        variant: "danger",
        label: "Action Failed",
        description: err?.response?.data?.message ?? "Could not reject booking.",
      });
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    Alert.alert("Cancel Booking", "Are you sure you want to cancel this booking?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Yes",
        style: "destructive",
        onPress: async () => {
          try {
            await cancelBooking(bookingId);
            toast.show({
              variant: "success",
              label: "Booking Cancelled",
              description: "Your amenity booking has been cancelled.",
            });
          } catch (err: any) {
            toast.show({
              variant: "danger",
              label: "Cancellation Failed",
              description: err?.response?.data?.message ?? err.message,
            });
          }
        },
      },
    ]);
  };

  // Differentiate Admin's own bookings vs Resident requests
  const adminOwnBookings = bookings.filter((b) => {
    const resId = typeof b.resident === "object" ? b.resident?._id : b.resident;
    return resId === user?._id;
  });

  const residentRequests = bookings.filter((b) => {
    const resId = typeof b.resident === "object" ? b.resident?._id : b.resident;
    return resId !== user?._id;
  });

  const myBookingsList = isAdmin ? adminOwnBookings : bookings;

  return (
    <FlatList
      data={amenities}
      keyExtractor={(item) => item._id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 100,
        paddingBottom: 100,
      }}
      ListHeaderComponent={
        <View className="mb-6 gap-6">
          {/* Admin Section: Resident Booking Requests */}
          {isAdmin && residentRequests.length > 0 && (
            <View className="gap-3">
              <Card.Title>Resident Booking Requests</Card.Title>
              <FlatList
                horizontal
                data={residentRequests}
                keyExtractor={(item) => item._id}
                showsHorizontalScrollIndicator={false}
                ItemSeparatorComponent={() => <View className="w-3" />}
                contentContainerStyle={{ paddingBottom: 10 }}
                renderItem={({ item }) => {
                  const residentName =
                    typeof item.resident === "object"
                      ? item.resident?.name
                      : "Resident";

                  return (
                    <Card className="w-80">
                      <Card.Body className="gap-3">
                        <View className="flex-row items-center justify-between">
                          <View className="flex-1 mr-2">
                            <Card.Title>{item.amenity?.name ?? "Amenity"}</Card.Title>
                            <Card.Description>Requested by: {residentName}</Card.Description>
                          </View>
                          <Chip
                            variant="secondary"
                            color={
                              item.status === "approved"
                                ? "success"
                                : item.status === "pending"
                                ? "warning"
                                : "default"
                            }
                          >
                            <Chip.Label className="capitalize">{item.status}</Chip.Label>
                          </Chip>
                        </View>

                        <View className="gap-1">
                          {item.date ? <Card.Description>Date: {item.date}</Card.Description> : null}
                          <Card.Description>
                            Time: {item.startTime} - {item.endTime}
                          </Card.Description>
                        </View>

                        {item.status === "pending" && (
                          <View className="flex-row gap-2 mt-1">
                            <Button
                              className="flex-1"
                              onPress={() => handleApprove(item._id)}
                            >
                              <Lucide name="check" size={16} color="white" />
                              <Button.Label>Approve</Button.Label>
                            </Button>

                            <Button
                              variant="danger"
                              className="flex-1"
                              onPress={() => handleReject(item._id)}
                            >
                              <Lucide name="x" size={16} color="white" />
                              <Button.Label>Reject</Button.Label>
                            </Button>
                          </View>
                        )}
                      </Card.Body>
                    </Card>
                  );
                }}
              />
            </View>
          )}

          {/* User's Own Bookings */}
          {myBookingsList.length > 0 && (
            <View className="gap-3">
              <Card.Title>My Bookings</Card.Title>
              <FlatList
                horizontal
                data={myBookingsList}
                keyExtractor={(item) => item._id}
                showsHorizontalScrollIndicator={false}
                ItemSeparatorComponent={() => <View className="w-3" />}
                contentContainerStyle={{ paddingBottom: 10 }}
                renderItem={({ item }) => (
                  <Card className="w-72">
                    <Card.Body className="gap-3">
                      <View className="flex-row items-center justify-between">
                        <Card.Title>{item.amenity?.name ?? "Amenity"}</Card.Title>
                        <Chip variant="secondary">
                          <Chip.Label className="capitalize">{item.status}</Chip.Label>
                        </Chip>
                      </View>

                      <View className="gap-1">
                        {item.date ? <Card.Description>Date: {item.date}</Card.Description> : null}
                        <Card.Description>
                          Time: {item.startTime} - {item.endTime}
                        </Card.Description>
                      </View>

                      {item.status !== "cancelled" && item.status !== "rejected" && (
                        <Button variant="danger" onPress={() => handleCancelBooking(item._id)}>
                          <Lucide name="trash" size={16} color="white" />
                          <Button.Label>Cancel Booking</Button.Label>
                        </Button>
                      )}
                    </Card.Body>
                  </Card>
                )}
              />
            </View>
          )}

          <Card.Title>Available Amenities</Card.Title>
        </View>
      }
      ItemSeparatorComponent={() => <View className="h-4" />}
      renderItem={({ item }) => (
        <Card className="p-0 h-96">
          <View className="relative h-full w-full">
            <Image
              source={{ uri: item.image }}
              resizeMode="cover"
              className="absolute inset-0 h-full w-full"
            />

            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.15)", "rgba(0,0,0,0.45)", "rgba(0,0,0,0.88)"]}
              locations={[0.2, 0.45, 0.7, 1]}
              className="absolute inset-0"
            />

            <View className="flex-1 justify-end p-5 gap-4">
              <View className="gap-2">
                <Card.Title className="text-white text-2xl">{item.name}</Card.Title>

                <Card.Description numberOfLines={2} className="text-white/80">
                  {item.description}
                </Card.Description>

                <View className="flex-row justify-between mt-2">
                  <View className="flex-row items-center gap-1">
                    <Lucide name="clock-3" size={16} color={accentForeground} />
                    <Card.Description className="text-white">{item.openingTime}</Card.Description>
                  </View>

                  <View className="flex-row items-center gap-1">
                    <Lucide name="users" size={16} color={accentForeground} />
                    <Card.Description className="text-white">{item.capacity}</Card.Description>
                  </View>

                  <View className="flex-row items-center gap-1">
                    <Lucide name="timer" size={16} color={accentForeground} />
                    <Card.Description className="text-white">
                      {item.maxDuration} min
                    </Card.Description>
                  </View>
                </View>
              </View>

              <View className="flex-row gap-3">
                <View className="justify-center">
                  <Card.Title className="text-white">Free</Card.Title>
                </View>

                <Button
                  className="flex-1 rounded-full"
                  onPress={() => handleBookAmenity(item)}
                >
                  <Button.Label>Reserve Now</Button.Label>
                  <Lucide name="chevron-right" size={20} color="white" />
                </Button>
              </View>
            </View>
          </View>
        </Card>
      )}
    />
  );
};

export default Amenities;
