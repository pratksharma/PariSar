import Visitor from "../models/visitor.model.js";
import VisitorEntry from "../models/visitorEntry.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import crypto from "crypto";

const getSocietyId = (user) => user?.society?._id || user?.society;

const buildScanQuery = (req, guard) => {
    const societyId = getSocietyId(guard);

    if (req.body?.qrToken) {
        return {
            qrToken: String(req.body.qrToken).trim(),
            society: societyId,
        };
    }

    return {
        _id: req.params.entryId,
        society: societyId,
    };
};

export const getVisitors = asyncHandler(async (req, res) => {
    const user = req.user;

    if (user.approvalStatus !== "APPROVED") {
        throw new ApiError(403, "Your society request must be approved first.");
    }

    if (!user.society) {
        throw new ApiError(400, "User is not associated with any society.");
    }

    const query = {
        society: user.society,
    };

    if (user.role === "resident") {
        query.resident = user._id;
    } else if (!["guard", "admin"].includes(user.role)) {
        throw new ApiError(403, "You are not authorized to view visitors.");
    }

    const visitors = await VisitorEntry.find(query)
        .populate("visitor")
        .populate("resident", "name tower flatNumber")
        .populate("createdByGuard", "name")
        .populate("approvedBy", "name")
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        visitors,
    });
});

export const createVisitor = asyncHandler(async (req, res) => {
    const {
        name,
        phone,
        vehicleNumber,
        purpose,
        type,
        tower,
        flatNumber,
        remarks,
    } = req.body;

    const user = req.user;

    if (!["guard", "admin"].includes(user.role)) {
        throw new ApiError(403, "Only guards and admins can create visitor entries.");
    }

    if (user.approvalStatus !== "APPROVED") {
        throw new ApiError(403, "Your account must be approved first.");
    }

    if (!user.society) {
        throw new ApiError(400, "User is not assigned to any society.");
    }

    let resident = await User.findOne({
        society: user.society,
        tower,
        flatNumber,
        role: "resident",
        approvalStatus: "APPROVED",
    });

    if (!resident && user.role === "admin") {
        resident = user;
    }

    if (!resident) {
        throw new ApiError(404, `No approved resident found in Tower ${tower}, Flat ${flatNumber}.`);
    }

    let visitor = await Visitor.findOne({ phone });

    if (!visitor) {
        visitor = await Visitor.create({
            name,
            phone,
            vehicleNumber,
        });
    }

    const visitorEntry = await VisitorEntry.create({
        society: getSocietyId(user),
        visitor: visitor._id,
        resident: resident._id,
        createdByGuard: user._id,

        purpose,
        type,
        tower,
        flatNumber,
        remarks,

        status: user.role === "admin" ? "approved" : "pending",
        approvedBy: user.role === "admin" ? user._id : undefined,
        qrToken: null,
    });

    const populatedEntry = await VisitorEntry.findById(visitorEntry._id)
        .populate("visitor")
        .populate("resident", "name phone tower flatNumber");

    res.status(201).json({
        success: true,
        message: "Visitor entry created successfully.",
        visitorEntry: populatedEntry,
    });
});

export const createPreApprovedVisitor = asyncHandler(async (req, res) => {
    const {
        name,
        phone,
        vehicleNumber,
        purpose,
        type,
        tower,
        flatNumber,
        remarks,
        expectedAt,
    } = req.body;

    const user = req.user;

    if (!["resident", "admin"].includes(user.role)) {
        throw new ApiError(403, "Only residents and admins can pre-approve visitors.");
    }

    if (user.approvalStatus !== "APPROVED") {
        throw new ApiError(403, "Your society request must be approved first.");
    }

    if (!user.society) {
        throw new ApiError(400, "You are not associated with any society.");
    }

    const targetTower = tower || user.tower || "Main";
    const targetFlat = flatNumber || user.flatNumber || "Admin";

    let visitor = await Visitor.findOne({ phone });

    if (!visitor) {
        visitor = await Visitor.create({
            name,
            phone,
            vehicleNumber,
        });
    }

    const visitorEntry = await VisitorEntry.create({
        society: user.society,
        visitor: visitor._id,
        resident: user._id,
        approvedBy: user._id,

        purpose,
        type,
        tower: targetTower,
        flatNumber: targetFlat,
        remarks,
        expectedAt,

        status: "approved",
        qrToken: crypto.randomUUID(),
    });

    const populatedEntry = await VisitorEntry.findById(visitorEntry._id)
        .populate("visitor")
        .populate("resident", "name phone tower flatNumber");

    res.status(201).json({
        success: true,
        message: "Visitor pre-approved successfully.",
        visitorEntry: populatedEntry,
    });
});

export const approveVisitor = asyncHandler(async (req, res) => {
    const { entryId } = req.params;
    const user = req.user;

    if (!["resident", "admin"].includes(user.role)) {
        throw new ApiError(403, "Only residents and admins can approve visitors.");
    }

    if (user.approvalStatus !== "APPROVED") {
        throw new ApiError(403, "Your society request must be approved first.");
    }

    const visitorEntry = await VisitorEntry.findById(entryId);

    if (!visitorEntry) {
        throw new ApiError(404, "Visitor entry not found.");
    }

    if (user.role === "resident" && !visitorEntry.resident.equals(user._id)) {
        throw new ApiError(
            403,
            "You are not authorized to approve this visitor."
        );
    }

    if (visitorEntry.status !== "pending") {
        throw new ApiError(
            400,
            `Visitor is already ${visitorEntry.status}.`
        );
    }

    visitorEntry.status = "approved";
    visitorEntry.approvedBy = user._id;
    visitorEntry.qrToken = crypto.randomUUID();
    visitorEntry.qrUsed = false;

    await visitorEntry.save();

    const populatedEntry = await VisitorEntry.findById(visitorEntry._id)
        .populate("visitor")
        .populate("resident", "name phone tower flatNumber")
        .populate("createdByGuard", "name")
        .populate("approvedBy", "name");

    res.status(200).json({
        success: true,
        message: "Visitor approved successfully.",
        visitorEntry: populatedEntry,
    });
});

export const rejectVisitor = asyncHandler(async (req, res) => {
    const { entryId } = req.params;
    const user = req.user;

    if (!["resident", "admin"].includes(user.role)) {
        throw new ApiError(403, "Only residents and admins can reject visitors.");
    }

    if (user.approvalStatus !== "APPROVED") {
        throw new ApiError(403, "Your society request must be approved first.");
    }

    const visitorEntry = await VisitorEntry.findById(entryId);

    if (!visitorEntry) {
        throw new ApiError(404, "Visitor entry not found.");
    }

    if (user.role === "resident" && !visitorEntry.resident.equals(user._id)) {
        throw new ApiError(
            403,
            "You are not authorized to reject this visitor."
        );
    }

    if (visitorEntry.status !== "pending") {
        throw new ApiError(
            400,
            `Visitor is already ${visitorEntry.status}.`
        );
    }

    visitorEntry.status = "rejected";
    visitorEntry.approvedBy = user._id;

    await visitorEntry.save();

    const populatedRejectedEntry = await VisitorEntry.findById(visitorEntry._id)
        .populate("visitor")
        .populate("resident", "name phone tower flatNumber")
        .populate("createdByGuard", "name")
        .populate("approvedBy", "name");

    res.status(200).json({
        success: true,
        message: "Visitor rejected successfully.",
        visitorEntry: populatedRejectedEntry,
    });
});

export const markVisitorEntry = asyncHandler(async (req, res) => {
    const user = req.user;

    if (!["guard", "admin"].includes(user.role)) {
        throw new ApiError(403, "Only guards and admins can mark visitor entry.");
    }

    if (user.approvalStatus !== "APPROVED") {
        throw new ApiError(403, "Your account must be approved first.");
    }

    const visitorEntry = await VisitorEntry.findOne(buildScanQuery(req, user));

    if (!visitorEntry) {
        throw new ApiError(404, "Visitor entry not found.");
    }

    if (visitorEntry.status !== "approved") {
        throw new ApiError(
            400,
            "Only approved visitors can be checked in."
        );
    }

    if (visitorEntry.qrUsed) {
        throw new ApiError(400, "This visitor QR code has already been used.");
    }

    visitorEntry.status = "checked_in";
    visitorEntry.checkedInAt = new Date();
    visitorEntry.qrUsed = true;

    await visitorEntry.save();

    const populatedEntry = await VisitorEntry.findById(visitorEntry._id)
        .populate("visitor")
        .populate("resident", "name phone tower flatNumber")
        .populate("createdByGuard", "name")
        .populate("approvedBy", "name");

    res.status(200).json({
        success: true,
        message: "Visitor checked in successfully.",
        visitorEntry: populatedEntry,
    });
});

export const markVisitorExit = asyncHandler(async (req, res) => {
    const { entryId } = req.params;
    const user = req.user;

    if (!["guard", "admin"].includes(user.role)) {
        throw new ApiError(403, "Only guards and admins can mark visitor exit.");
    }

    if (user.approvalStatus !== "APPROVED") {
        throw new ApiError(403, "Your account must be approved first.");
    }

    const visitorEntry = await VisitorEntry.findById(entryId);

    if (!visitorEntry) {
        throw new ApiError(404, "Visitor entry not found.");
    }

    if (!visitorEntry.society.equals(user.society)) {
        throw new ApiError(
            403,
            "You are not authorized to access this visitor."
        );
    }

    if (visitorEntry.status !== "checked_in") {
        throw new ApiError(
            400,
            "Visitor has not checked in yet."
        );
    }

    visitorEntry.status = "checked_out";
    visitorEntry.checkedOutAt = new Date();

    await visitorEntry.save();

    const populatedExitEntry = await VisitorEntry.findById(visitorEntry._id)
        .populate("visitor")
        .populate("resident", "name phone tower flatNumber")
        .populate("createdByGuard", "name")
        .populate("approvedBy", "name");

    res.status(200).json({
        success: true,
        message: "Visitor checked out successfully.",
        visitorEntry: populatedExitEntry,
    });
});