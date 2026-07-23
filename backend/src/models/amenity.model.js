import mongoose from "mongoose";

const AmenitySchema = new mongoose.Schema(
    {
        society: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Society",
            required: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
            default: "",
        },

        image: {
            type: String,
            default: "",
        },

        openingTime: {
            type: String, // HH:mm
            required: true,
        },

        closingTime: {
            type: String, // HH:mm
            required: true,
        },

        maxDuration: {
            type: Number, // Minutes
            required: true,
        },

        capacity: {
            type: Number,
            default: 1,
            min: 1,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

AmenitySchema.index(
    { society: 1, name: 1 },
    { unique: true }
);

const Amenity = mongoose.model("Amenity", AmenitySchema);

export default Amenity;