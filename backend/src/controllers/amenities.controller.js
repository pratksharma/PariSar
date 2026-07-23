import Amenity from "../models/amenity.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const populateAmenities = asyncHandler(async (req, res) => {
    const user = req.user;

    if (user.role !== "admin") {
        throw new ApiError(403, "Only admins can populate amenities.");
    }

    if (!user.society) {
        throw new ApiError(400, "Admin is not associated with any society.");
    }

    const existingAmenities = await Amenity.countDocuments({
        society: user.society,
    });

    if (existingAmenities > 0) {
        throw new ApiError(
            400,
            "Amenities have already been populated for this society."
        );
    }

    const amenities = [
        {
            society: user.society,
            name: "Gym",
            description: "Fully equipped gym for residents.",
            image: "https://images.pexels.com/photos/17227607/pexels-photo-17227607.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            openingTime: "06:00",
            closingTime: "22:00",
            maxDuration: 120,
            capacity: 20,
        },
        {
            society: user.society,
            name: "Pool",
            description: "Swimming pool for residents.",
            image: "https://images.pexels.com/photos/9828113/pexels-photo-9828113.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            openingTime: "06:00",
            closingTime: "21:00",
            maxDuration: 90,
            capacity: 30,
        },
        {
            society: user.society,
            name: "Cricket Nets",
            description: "Practice cricket nets.",
            image: "https://images.pexels.com/photos/30387495/pexels-photo-30387495.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            openingTime: "06:00",
            closingTime: "22:00",
            maxDuration: 120,
            capacity: 10,
        },
        {
            society: user.society,
            name: "Club House",
            description: "Community hall for meetings and events.",
            image: "https://images.pexels.com/photos/33944304/pexels-photo-33944304.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            openingTime: "08:00",
            closingTime: "23:00",
            maxDuration: 240,
            capacity: 100,
        },
    ];

    const createdAmenities = await Amenity.insertMany(amenities);

    res.status(201).json({
        success: true,
        message: "Amenities populated successfully.",
        data: createdAmenities,
    });
});

export const getAmenities = asyncHandler(async (req, res) => {
    const user = req.user;

    if (!user.society) {
        throw new ApiError(400, "User is not associated with any society.");
    }

    const amenities = await Amenity.find({
        society: user.society,
        isActive: true,
    }).sort({
        name: 1,
    });

    res.status(200).json({
        success: true,
        data: amenities,
    });
});

export const createAmenity = asyncHandler(async (req, res) => {
    const user = req.user;

    if (user.role !== "admin") {
        throw new ApiError(403, "Only admins can create amenities.");
    }

    if (!user.society) {
        throw new ApiError(400, "Admin is not associated with any society.");
    }

    const {
        name,
        description,
        image,
        openingTime,
        closingTime,
        maxDuration,
        capacity,
        requiresApproval,
    } = req.body;

    if (
        !name ||
        !openingTime ||
        !closingTime ||
        maxDuration === undefined
    ) {
        throw new ApiError(
            400,
            "Name, opening time, closing time and max duration are required."
        );
    }

    const existingAmenity = await Amenity.findOne({
        society: user.society,
        name: name.trim(),
    });

    if (existingAmenity) {
        throw new ApiError(
            409,
            "An amenity with this name already exists."
        );
    }

    const amenity = await Amenity.create({
        society: user.society,
        name: name.trim(),
        description: description?.trim() || "",
        image: image?.trim() || "",
        openingTime,
        closingTime,
        maxDuration: Number(maxDuration),
        capacity: capacity ? Number(capacity) : 1,
        requiresApproval:
            typeof requiresApproval === "boolean"
                ? requiresApproval
                : true,
    });

    res.status(201).json({
        success: true,
        message: "Amenity created successfully.",
        date: amenity,
    });
});

export const getAmenityBookings = asyncHandler(async (req, res) => {
    const user = req.user;

    if (!user.society) {
        throw new ApiError(400, "User is not associated with any society.");
    }

    const filter = {
        society: user.society,
    };

    if (user.role !== "admin") {
        filter.resident = user._id;
    }

    const bookings = await AmenityBooking.find(filter)
        .populate("amenity")
        .populate("resident", "name email phone")
        .populate("admin", "name")
        .sort({
            bookingDate: -1,
            startTime: 1,
        });

    res.status(200).json({
        success: true,
        data: bookings,
    });
});

export const bookAmenity = asyncHandler(async (req, res) => {
    const user = req.user;

    if (!user.society) {
        throw new ApiError(400, "You are not associated with any society.");
    }

    const {
        amenity,
        bookingDate,
        startTime,
        endTime,
        purpose,
    } = req.body;

    if (!amenity || !bookingDate || !startTime || !endTime) {
        throw new ApiError(
            400,
            "Amenity, booking date, start time and end time are required."
        );
    }

    const amenityDoc = await Amenity.findOne({
        _id: amenity,
        society: user.society,
        isActive: true,
    });

    if (!amenityDoc) {
        throw new ApiError(404, "Amenity not found.");
    }

    const conflict = await AmenityBooking.findOne({
        amenity,
        bookingDate,
        status: "approved",
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
    });

    if (conflict) {
        throw new ApiError(
            409,
            "This amenity is already booked for the selected time."
        );
    }

    const isAdmin = user.role === "admin";

    const booking = await AmenityBooking.create({
        society: user.society,
        amenity,
        resident: user._id,
        bookingDate,
        startTime,
        endTime,
        purpose: purpose?.trim() || "",

        status: isAdmin ? "approved" : "pending",

        admin: isAdmin ? user._id : null,
        approvedAt: isAdmin ? new Date() : null,
    });

    res.status(201).json({
        success: true,
        message: isAdmin
            ? "Amenity booked successfully."
            : "Booking request submitted successfully.",
        data: booking,
    });
});

export const approveAmenityBooking = asyncHandler(async (req, res) => {
    const user = req.user;

    if (user.role !== "admin") {
        throw new ApiError(403, "Only admins can approve amenity bookings.");
    }

    const { bookingId } = req.params;

    const booking = await AmenityBooking.findOne({
        _id: bookingId,
        society: user.society,
    });

    if (!booking) {
        throw new ApiError(404, "Booking request not found.");
    }

    if (booking.status !== "pending") {
        throw new ApiError(
            400,
            "Only pending booking requests can be approved."
        );
    }

    const amenity = await Amenity.findById(booking.amenity);

    if (!amenity || !amenity.isActive) {
        throw new ApiError(404, "Amenity not found or inactive.");
    }

    const overlappingBookings = await AmenityBooking.countDocuments({
        amenity: booking.amenity,
        bookingDate: booking.bookingDate,
        status: "approved",
        startTime: { $lt: booking.endTime },
        endTime: { $gt: booking.startTime },
    });

    if (overlappingBookings >= amenity.capacity) {
        throw new ApiError(
            409,
            "This amenity has reached its booking capacity for the selected time."
        );
    }

    booking.status = "approved";
    booking.admin = user._id;
    booking.approvedAt = new Date();

    await booking.save();

    res.status(200).json({
        success: true,
        message: "Booking approved successfully.",
        data: booking,
    });
});

export const rejectAmenityBooking = asyncHandler(async (req, res) => {
    const user = req.user;

    if (user.role !== "admin") {
        throw new ApiError(403, "Only admins can reject amenity bookings.");
    }

    const { bookingId } = req.params;

    const booking = await AmenityBooking.findOne({
        _id: bookingId,
        society: user.society,
    });

    if (!booking) {
        throw new ApiError(404, "Booking request not found.");
    }

    if (booking.status !== "pending") {
        throw new ApiError(
            400,
            "Only pending booking requests can be rejected."
        );
    }

    booking.status = "rejected";
    booking.admin = user._id;
    booking.rejectedAt = new Date();

    await booking.save();

    res.status(200).json({
        success: true,
        message: "Booking rejected successfully.",
        data: booking,
    });
});

export const cancelAmenityBooking = asyncHandler(async (req, res) => {
    const user = req.user;
    const { bookingId } = req.params;

    const booking = await AmenityBooking.findOne({
        _id: bookingId,
        resident: user._id,
        society: user.society,
    });

    if (!booking) {
        throw new ApiError(404, "Booking not found.");
    }

    if (booking.status === "cancelled") {
        throw new ApiError(400, "Booking has already been cancelled.");
    }

    if (booking.status === "rejected") {
        throw new ApiError(400, "Rejected bookings cannot be cancelled.");
    }

    const bookingStart = new Date(booking.bookingDate);
    const [hours, minutes] = booking.startTime.split(":").map(Number);

    bookingStart.setHours(hours, minutes, 0, 0);

    if (new Date() >= bookingStart) {
        throw new ApiError(
            400,
            "Bookings cannot be cancelled after they have started."
        );
    }

    booking.status = "cancelled";
    booking.cancelledAt = new Date();

    await booking.save();

    res.status(200).json({
        success: true,
        message: "Booking cancelled successfully.",
        data: booking,
    });
});