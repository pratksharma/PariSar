import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import { generateAccessToken } from '../utils/accessToken.js'
import { generateRefreshToken, verifyRefreshToken } from '../utils/refreshToken.js'

export const registerUser = async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;

        if (!name || !email || !phone || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "All fields are required.",
            });
        }

        const existingUser = await User.findOne({
            $or: [{ email }, { phone }],
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message:
                    existingUser.email === email
                        ? "Email already exists."
                        : "Phone number already exists.",
            });
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
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                message: "Email/Phone and password are required.",
            });
        }

        const user = await User.findOne({
            $or: [
                { email: identifier },
                { phone: identifier },
            ],
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials.",
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials.",
            });
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
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

export const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "Refresh token is required.",
            });
        }

        const decoded = verifyRefreshToken(refreshToken);

        const user = await User.findById(decoded.id).select("+refreshTokenHash");;

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        const isValid = await bcrypt.compare(
            refreshToken,
            user.refreshTokenHash
        );

        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token.",
            });
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
    } catch (error) {
        console.error(error);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired refresh token.",
        });
    }
};

export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

export const logoutUser = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.id, {
            refreshTokenHash: null,
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully.",
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};