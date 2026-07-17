import crypto from "crypto";
import Society from "../models/society.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const generateSocietyCode = async () => {
    while (true) {
        const code = crypto
            .randomBytes(3)
            .toString("hex")
            .toUpperCase(); // e.g. A1B2C3

        const exists = await Society.exists({ uniqueCode: code });

        if (!exists) return code;
    }
};

export const createSociety = asyncHandler(async (req, res) => {
    const { name, address, description } = req.body;

    if (!name || !address) {
        throw new ApiError(400, "Name and address are required");
    }

    const existingSociety = await Society.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, "i") }
    });

    if (existingSociety) {
        throw new ApiError(409, "A society with this name already exists");
    }

    const user = await User.findById(req.user.id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.society) {
        throw new ApiError(400, "You are already a member of a society");
    }

    const uniqueCode = await generateSocietyCode();

    const society = await Society.create({
        name,
        address,
        description,
        uniqueCode,
        admin: user._id,
        totalResidents: 1,
    });

    user.role = "admin";
    user.society = society._id;
    user.isVerified = true;
    user.approvalStatus = "APPROVED";

    await user.save();

    res.status(201).json({
        success: true,
        message: "Society created successfully",
        society,
    });
});