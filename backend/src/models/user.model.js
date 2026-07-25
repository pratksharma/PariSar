import mongoose, { Types } from "mongoose";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['resident', 'guard', 'admin'],
        default: "resident",
        required: true
    },
    society: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Society",
        default: null
    },
    flatNumber: String,
    tower: String,
    password: {
        type: String,
        required: true,
        select: false
    },
    refreshTokenHash: {
        type: String,
        default: null,
        select: false
    },
    approvalStatus: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED"],
        default: "PENDING"
    }
}, { timestamps: true })

const User = mongoose.model("User", UserSchema);

export default User;