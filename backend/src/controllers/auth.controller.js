import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import { generateAccessToken } from '../utils/accessToken.js'
import { generateRefreshToken, verifyRefreshToken } from '../utils/refreshToken.js'
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js"

export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, phone, password, role } = req.body;

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

    const user = await User.create({
        name,
        email,
        phone,
        password: hashedPassword,
        role,
    });

    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user);

    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await user.save();


    const userData = user.toObject();

    return res.status(201).json({
        success: true,
        message: "User registered successfully.",
        accessToken,
        refreshToken,
        user: userData,
    });
});

export const loginUser = asyncHandler(async (req, res) => {
    const { identifier, password } = req.body;

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

    const userData = user.toObject();
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