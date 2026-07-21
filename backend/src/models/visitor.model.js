import mongoose from "mongoose";

const VisitorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        phone: {
            type: String,
            required: true,
            trim: true,
        },

        vehicleNumber: {
            type: String,
            trim: true,
            uppercase: true,
        },
    },
    {
        timestamps: true,
    }
);

VisitorSchema.index({ phone: 1 });

const Visitor = mongoose.model("Visitor", VisitorSchema);

export default Visitor