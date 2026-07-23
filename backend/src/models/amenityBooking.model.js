import mongoose from "mongoose";

const AmenityBookingSchema = new mongoose.Schema(
    {
        society: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Society",
            required: true,
        },

        amenity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Amenity",
            required: true,
        },

        resident: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        bookingDate: {
            type: Date,
            required: true,
        },

        startTime: {
            type: String, // HH:mm
            required: true,
        },

        endTime: {
            type: String, // HH:mm
            required: true,
        },

        purpose: {
            type: String,
            trim: true,
            default: "",
        },

        status: {
            type: String,
            enum: [
                "pending",
                "approved",
                "rejected",
                "cancelled"
            ],
            default: "pending",
        },

        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        approvedAt: {
            type: Date,
            default: null,
        },

        rejectedAt: {
            type: Date,
            default: null,
        },

        cancelledAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

AmenityBookingSchema.index({
    amenity: 1,
    bookingDate: 1,
    status: 1,
});

AmenityBookingSchema.index({
    resident: 1,
    bookingDate: -1,
});

const AmenityBooking = mongoose.model("AmenityBooking", AmenityBookingSchema);

export default AmenityBooking;