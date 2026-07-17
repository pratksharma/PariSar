import mongoose from "mongoose";

const GuardInvitationSchema = new mongoose.Schema(
    {
        society: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Society",
            required: true,
        },
        invitedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            default: null,
        },
        inviteCode: {
            type: String,
            required: true,
            unique: true,
        },
        accepted: {
            type: Boolean,
            default: false,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const guardInvitation = mongoose.model("GuardInvitation", GuardInvitationSchema);

export default guardInvitation;