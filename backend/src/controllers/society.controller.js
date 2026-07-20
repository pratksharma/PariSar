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
    user.approvalStatus = "APPROVED";

    await user.save();

    res.status(201).json({
        success: true,
        message: "Society created successfully",
        data: society,
    });
});

export const getMySociety = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (!user.society) {
        throw new ApiError(404, "You are not a member of any society");
    }

    const society = await Society.findById(user.society).populate("admin");

    res.status(200).json({
        success: true,
        message: "Society data fetched successfully",
        data: society
    })
})

export const updateSociety = asyncHandler(async (req, res) => {
    const { name, address, description } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.role !== "admin" || !user.society) {
        throw new ApiError(403, "Only society admin can update society details");
    }

    const society = await Society.findById(user.society);

    if (!society) {
        throw new ApiError(404, "Society not found");
    }

    if (name) society.name = name;
    if (address) society.address = address;
    if (description !== undefined) society.description = description;

    await society.save();

    res.status(200).json({
        success: true,
        message: "Society updated successfully",
        data: society,
    });
});

export const deleteSociety = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.role !== "admin" || !user.society) {
        throw new ApiError(403, "Only society admin can delete the society");
    }

    const society = await Society.findById(user.society);

    if (!society) {
        throw new ApiError(404, "Society not found");
    }

    await Society.findByIdAndDelete(society._id);

    user.role = "resident";
    user.society = null;
    user.approvalStatus = "PENDING";

    await user.save();

    res.status(200).json({
        success: true,
        message: "Society deleted successfully",
    });
});

export const joinSociety = asyncHandler(async (req, res) => {
    const { uniqueCode, tower, flatNumber } = req.body;

    if (!uniqueCode || !tower || !flatNumber) {
        throw new ApiError(
            400,
            "Unique code, tower and flat number are required"
        );
    }

    const user = await User.findById(req.user.id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.society) {
        throw new ApiError(400, "You are already a member of a society");
    }

    const society = await Society.findOne({
        uniqueCode: uniqueCode.trim().toUpperCase(),
    });

    if (!society) {
        throw new ApiError(404, "Invalid society code");
    }

    user.society = society._id;
    user.tower = tower.trim().toUpperCase();
    user.flatNumber = flatNumber.trim();
    user.approvalStatus = "PENDING";

    await user.save();

    res.status(200).json({
        success: true,
        message:
            "Join request sent successfully. Please wait for the society admin to approve your request.",
    });
});

export const getPendingRequests = asyncHandler(async (req, res) => {
    const admin = await User.findById(req.user.id);

    if (!admin) {
        throw new ApiError(404, "User not found");
    }

    if (admin.role !== "admin" || !admin.society) {
        throw new ApiError(403, "Only society admin can view pending requests");
    }

    const pendingRequests = await User.find({
        society: admin.society,
        approvalStatus: "PENDING",
        role: "resident",
    }).select("-password -refreshTokenHash");

    res.status(200).json({
        success: true,
        message: "Pending requests fetched successfully",
        data: pendingRequests,
    });
});

export const approveRequest = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const admin = await User.findById(req.user.id);

    if (!admin) {
        throw new ApiError(404, "User not found");
    }

    if (admin.role !== "admin" || !admin.society) {
        throw new ApiError(403, "Only society admin can approve requests");
    }

    const resident = await User.findById(userId);

    if (!resident) {
        throw new ApiError(404, "Resident not found");
    }

    if (!resident.society || resident.society.toString() !== admin.society.toString()) {
        throw new ApiError(400, "Resident does not belong to your society");
    }

    if (resident.approvalStatus !== "PENDING") {
        throw new ApiError(400, "This request has already been processed");
    }

    resident.approvalStatus = "APPROVED";

    await resident.save();

    await Society.findByIdAndUpdate(admin.society, {
        $inc: { totalResidents: 1 },
    });

    res.status(200).json({
        success: true,
        message: "Resident approved successfully",
        data: resident,
    });
});

export const rejectRequest = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const admin = await User.findById(req.user.id);

    if (!admin) {
        throw new ApiError(404, "User not found");
    }

    if (admin.role !== "admin" || !admin.society) {
        throw new ApiError(403, "Only society admin can reject requests");
    }

    const resident = await User.findById(userId);

    if (!resident) {
        throw new ApiError(404, "Resident not found");
    }

    if (
        !resident.society ||
        resident.society.toString() !== admin.society.toString()
    ) {
        throw new ApiError(400, "Resident does not belong to your society");
    }

    if (resident.approvalStatus !== "PENDING") {
        throw new ApiError(400, "This request has already been processed");
    }

    resident.society = null;
    resident.tower = null;
    resident.flatNumber = null;
    resident.approvalStatus = "REJECTED";

    await resident.save();

    res.status(200).json({
        success: true,
        message: "Join request rejected successfully",
    });
});

export const removeMember = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const admin = await User.findById(req.user.id);

    if (!admin) {
        throw new ApiError(404, "User not found");
    }

    if (admin.role !== "admin" || !admin.society) {
        throw new ApiError(403, "Only society admin can remove members");
    }

    if (admin._id.toString() === userId) {
        throw new ApiError(400, "Admin cannot remove themselves");
    }

    const member = await User.findById(userId);

    if (!member) {
        throw new ApiError(404, "Member not found");
    }

    if (
        !member.society ||
        member.society.toString() !== admin.society.toString()
    ) {
        throw new ApiError(400, "Member does not belong to your society");
    }

    member.society = null;
    member.tower = null;
    member.flatNumber = null;
    member.role = "resident";
    member.approvalStatus = "PENDING";

    await member.save();

    await Society.findByIdAndUpdate(admin.society, {
        $inc: { totalResidents: -1 },
    });

    res.status(200).json({
        success: true,
        message: "Member removed successfully",
    });
});

export const getAllMembers = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (!user.society) {
        throw new ApiError(403, "You are not a member of any society");
    }

    const members = await User.find({
        society: user.society,
        approvalStatus: "APPROVED",
    })
        .select("-password -refreshTokenHash")
        .sort({ tower: 1, flatNumber: 1, name: 1 });

    res.status(200).json({
        success: true,
        message: "Members fetched successfully",
        data: members,
    });
});

export const inviteGuard = asyncHandler(async (req, res) => {
    const admin = req.user;
    const { name, phone, email } = req.body;

    if (!name || !phone)
        throw new ApiError(400, "Name and phone are required.");

    if (admin.role !== "admin")
        throw new ApiError(403, "Only admins can invite guards.");

    const society = await Society.findById(admin.society);

    if (!society)
        throw new ApiError(404, "Society not found.");

    const existingInvite = await GuardInvitation.findOne({
        phone,
        accepted: false,
        expiresAt: { $gt: new Date() },
    });

    if (existingInvite)
        throw new ApiError(400, "An active invitation already exists.");

    const inviteCode = crypto.randomBytes(4).toString("hex").toUpperCase();

    const invitation = await GuardInvitation.create({
        society: society._id,
        invitedBy: admin._id,
        name,
        phone,
        email,
        inviteCode,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(201).json({
        success: true,
        message: "Guard invitation created successfully.",
        invitation,
    });
});

export const acceptGuardInvite = asyncHandler(async (req, res) => {
    const { inviteCode } = req.body;
    const user = req.user;

    if (!inviteCode)
        throw new ApiError(400, "Invite code is required.");

    if (user.society)
        throw new ApiError(400, "You already belong to a society.");

    const invitation = await GuardInvitation.findOne({
        inviteCode: inviteCode.toUpperCase(),
    });

    if (!invitation)
        throw new ApiError(404, "Invalid invite code.");

    if (invitation.accepted)
        throw new ApiError(400, "This invitation has already been used.");

    if (invitation.expiresAt < new Date())
        throw new ApiError(400, "Invitation has expired.");

    if (invitation.phone !== user.phone)
        throw new ApiError(
            403,
            "This invitation was issued for another phone number."
        );

    const society = await Society.findById(invitation.society);

    if (!society)
        throw new ApiError(404, "Society not found.");

    user.role = "guard";
    user.society = society._id;

    await user.save();

    if (!society.guards.includes(user._id)) {
        society.guards.push(user._id);
        await society.save();
    }

    invitation.accepted = true;
    await invitation.save();

    res.status(200).json({
        success: true,
        message: "Joined society as a guard successfully.",
    });
});

export const getSociety = asyncHandler(async (req, res) => {
    const { societyId } = req.params;

    const society = await Society.findById(societyId).populate("admin");

    if (!society) {
        throw new ApiError(404, "Society not found");
    }

    res.status(200).json({
        success: true,
        message: "Society data fetched successfully",
        data: society
    })
})