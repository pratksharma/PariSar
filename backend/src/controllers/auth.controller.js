import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import Society from "../models/society.model.js";
import { generateAccessToken } from '../utils/accessToken.js'
import { generateRefreshToken, verifyRefreshToken } from '../utils/refreshToken.js'
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js"
import GuardInvitation from "../models/guardInvitation.model.js";

export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
        throw new ApiError(400, "All fields are required.");
    }

    const existingUser = await User.findOne({
        $or: [{ email }, { phone }],
    });

    if (existingUser) {
        throw new ApiError(
            409,
            existingUser.email === email
                ? "Email already exists."
                : "Phone number already exists.",
            [],
            existingUser.email === email ? "email" : "phone"
        );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const guardInvitation = await GuardInvitation.findOne({
        phone,
        accepted: false,
        expiresAt: { $gt: new Date() },
    });

    const user = await User.create({
        name,
        email,
        phone,
        password: hashedPassword,
        role: guardInvitation ? "guard" : "resident",
        society: guardInvitation ? guardInvitation.society : undefined,
        approvalStatus: guardInvitation ? "APPROVED" : "PENDING",
    });

    if (guardInvitation) {
        const society = await Society.findById(guardInvitation.society);
        if (society) {
            if (!society.guards.includes(user._id)) {
                society.guards.push(user._id);
                society.totalGuards = (society.totalGuards ?? 0) + 1;
                await society.save();
            }
        }
        guardInvitation.accepted = true;
        await guardInvitation.save();
    }

    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user);

    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await user.save();

    const userData = (await User.findById(user._id).populate("society")).toObject();
    delete userData.password;
    delete userData.refreshTokenHash;

    return res.status(201).json({
        success: true,
        message: "User registered successfully.",
        accessToken,
        refreshToken,
        user: userData,
    });
});

export const registerGuard = asyncHandler(async (req, res) => {
    const { name, email, phone, password, inviteCode } = req.body;

    if (!name || !email || !phone || !password || !inviteCode) {
        throw new ApiError(400, "All fields including Joining Code are required.");
    }

    const invitation = await GuardInvitation.findOne({
        inviteCode: inviteCode.trim().toUpperCase(),
    });

    if (!invitation) {
        throw new ApiError(404, "Invalid Joining Code.");
    }

    if (invitation.accepted) {
        throw new ApiError(400, "This Joining Code has already been used.");
    }

    if (invitation.expiresAt < new Date()) {
        throw new ApiError(400, "This Joining Code has expired.");
    }

    if (invitation.phone && invitation.phone !== phone.trim()) {
        throw new ApiError(403, "This invitation was issued for another phone number.");
    }

    const existingUser = await User.findOne({
        $or: [{ email: email.trim() }, { phone: phone.trim() }],
    });

    if (existingUser) {
        throw new ApiError(
            409,
            existingUser.email === email.trim()
                ? "Email already registered. Please log in."
                : "Phone number already registered. Please log in.",
            [],
            existingUser.email === email.trim() ? "email" : "phone"
        );
    }

    const society = await Society.findById(invitation.society);
    if (!society) {
        throw new ApiError(404, "Associated society not found.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: hashedPassword,
        role: "guard",
        society: society._id,
        approvalStatus: "APPROVED",
    });

    if (!society.guards.includes(user._id)) {
        society.guards.push(user._id);
        society.totalGuards = (society.totalGuards ?? 0) + 1;
        await society.save();
    }

    invitation.accepted = true;
    await invitation.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await user.save();

    const userData = (await User.findById(user._id).populate("society")).toObject();
    delete userData.password;
    delete userData.refreshTokenHash;

    return res.status(201).json({
        success: true,
        message: "Guard account registered successfully.",
        accessToken,
        refreshToken,
        user: userData,
    });
});

export const loginUser = asyncHandler(async (req, res) => {
    const { identifier, password, role } = req.body;

    if (!identifier || !password) {
        throw new ApiError(400, "Email/Phone and password are required");
    }

    const user = await User.findOne({
        $or: [
            { email: identifier },
            { phone: identifier },
        ],
    }).select("+password");

    if (!user) {
        throw new ApiError(401, "Invalid credentials.");
    }

    if (role && role === "guard" && user.role !== "guard") {
        throw new ApiError(403, "This account is not a guard account. Please log in using Resident Login.");
    }

    const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid credentials.");
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await user.save();

    const userData = (await User.findById(user._id).populate("society")).toObject();
    delete userData.password;
    delete userData.refreshTokenHash;

    return res.status(200).json({
        success: true,
        message: "Login successful.",
        accessToken,
        refreshToken,
        user: userData,
    });
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        throw new ApiError(400, "Refresh token is required.");
    }

    const decoded = verifyRefreshToken(refreshToken);

    const user = await User.findById(decoded.id).select("+refreshTokenHash");;

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isValid = await bcrypt.compare(
        refreshToken,
        user.refreshTokenHash
    );

    if (!isValid) {
        throw new ApiError(401, "Invalid refresh token.");
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
    await user.save();

    return res.status(200).json({
        success: true,
        message: "Access token refreshed successfully.",
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    });
});

export const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).populate("society");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json({
        success: true,
        user,
    });
});

export const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user.id, {
        refreshTokenHash: null,
    });

    return res.status(200).json({
        success: true,
        message: "Logged out successfully.",
    });
});