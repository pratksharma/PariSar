import mongoose from "mongoose";

const visitorEntrySchema = new mongoose.Schema(
    {
        society: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Society",
            required: true,
        },

        visitor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Visitor",
            required: true,
        },

        resident: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        createdByGuard: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        purpose: {
            type: String,
            trim: true,
            required: true,
        },

        type: {
            type: String,
            enum: [
                "guest",
                "delivery",
                "cab",
                "maid",
                "cook",
                "driver",
                "technician",
                "other",
            ],
            default: "guest",
        },

        tower: {
            type: String,
            required: true,
            trim: true,
        },

        flatNumber: {
            type: String,
            required: true,
            trim: true,
        },

        status: {
            type: String,
            enum: [
                "pending",
                "approved",
                "rejected",
                "checked_in",
                "checked_out",
                "cancelled",
            ],
            default: "pending",
        },

        qrToken: {
            type: String,
            unique: true,
            sparse: true,
        },

        qrUsed: {
            type: Boolean,
            default: false,
        },

        expectedAt: Date,

        checkedInAt: Date,

        checkedOutAt: Date,

        remarks: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

visitorEntrySchema.index({ society: 1, status: 1 });
visitorEntrySchema.index({ resident: 1 });
visitorEntrySchema.index({ visitor: 1 });
visitorEntrySchema.index({ createdAt: -1 });

const VisitorEntry = mongoose.model("VisitorEntry", visitorEntrySchema);

export default VisitorEntry