import mongoose from "mongoose";

const ComplaintSchema = new mongoose.Schema(
    {
        society: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Society",
            required: true,
            index: true,
        },

        resident: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        status: {
            type: String,
            enum: ["open", "resolved"],
            default: "open",
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

ComplaintSchema.index({ society: 1, createdAt: -1 });
ComplaintSchema.index({ resident: 1, createdAt: -1 });

const Complaint = mongoose.model("Complaint", ComplaintSchema);

export default Complaint;