import mongoose, { Types } from "mongoose";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: [true, "Email must be unique"]
    },
    phone: {
        type: String,
        required: true,
        unique: [true, "Phone number must be unique"]
    },
    role: {
        type: String,
        enum: ['resident', 'gaurd', 'admin'],
        default: "resident",
        required: true
    },
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