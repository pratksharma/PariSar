import Visitor from "../models/visitor.model.js";
import VisitorEntry from "../models/visitorEntry.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import crypto from "crypto";

export const getVisitors = asyncHandler(async (req, res) => {
    const user = req.user;

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

    const guard = req.user;

    if (guard.role !== "guard") {
        throw new ApiError(403, "Only guards can create visitor entries.");
    }

    if (!guard.society) {
        throw new ApiError(400, "Guard is not assigned to any society.");
    }

    const resident = await User.findOne({
        society: guard.society,
        tower,
        flatNumber,
        role: "resident",
        isVerified: true,
    });

    if (!resident) {
        throw new ApiError(404, "Resident not found.");
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
        society: guard.society,
        visitor: visitor._id,
        resident: resident._id,

        createdByGuard: guard._id,

        purpose,
        type,
        tower,
        flatNumber,
        remarks,

        status: "pending",
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
        remarks,
        expectedAt,
    } = req.body;

    const resident = req.user;

    if (resident.role !== "resident") {
        throw new ApiError(403, "Only residents can pre-approve visitors.");
    }

    if (!resident.society) {
        throw new ApiError(400, "You are not associated with any society.");
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
        society: resident.society,
        visitor: visitor._id,
        resident: resident._id,
        approvedBy: resident._id,

        purpose,
        type,
        tower: resident.tower,
        flatNumber: resident.flatNumber,
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

    const resident = req.user;

    if (resident.role !== "resident") {
        throw new ApiError(403, "Only residents can approve visitors.");
    }

    const visitorEntry = await VisitorEntry.findById(entryId);

    if (!visitorEntry) {
        throw new ApiError(404, "Visitor entry not found.");
    }

    if (!visitorEntry.resident.equals(resident._id)) {
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
    visitorEntry.approvedBy = resident._id;
    visitorEntry.qrToken = crypto.randomUUID();
    visitorEntry.qrUsed = false;

    await visitorEntry.save();

    res.status(200).json({
        success: true,
        message: "Visitor approved successfully.",
        visitorEntry,
    });
});

export const rejectVisitor = asyncHandler(async (req, res) => {
    const { entryId } = req.params;

    const resident = req.user;

    if (resident.role !== "resident") {
        throw new ApiError(403, "Only residents can reject visitors.");
    }

    const visitorEntry = await VisitorEntry.findById(entryId);

    if (!visitorEntry) {
        throw new ApiError(404, "Visitor entry not found.");
    }

    if (!visitorEntry.resident.equals(resident._id)) {
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
    visitorEntry.approvedBy = resident._id;

    await visitorEntry.save();

    res.status(200).json({
        success: true,
        message: "Visitor rejected successfully.",
        visitorEntry,
    });
});

export const markVisitorEntry = asyncHandler(async (req, res) => {
    const { entryId } = req.params;

    const guard = req.user;

    if (guard.role !== "guard") {
        throw new ApiError(403, "Only guards can mark visitor entry.");
    }

    const visitorEntry = await VisitorEntry.findById(entryId);

    if (!visitorEntry) {
        throw new ApiError(404, "Visitor entry not found.");
    }

    if (!visitorEntry.society.equals(guard.society)) {
        throw new ApiError(
            403,
            "You are not authorized to access this visitor."
        );
    }

    if (visitorEntry.status !== "approved") {
        throw new ApiError(
            400,
            "Only approved visitors can be checked in."
        );
    }

    visitorEntry.status = "checked_in";
    visitorEntry.checkedInAt = new Date();

    await visitorEntry.save();

    res.status(200).json({
        success: true,
        message: "Visitor checked in successfully.",
        visitorEntry,
    });
});

export const markVisitorExit = asyncHandler(async (req, res) => {
    const { entryId } = req.params;

    const guard = req.user;

    if (guard.role !== "guard") {
        throw new ApiError(403, "Only guards can mark visitor exit.");
    }

    const visitorEntry = await VisitorEntry.findById(entryId);

    if (!visitorEntry) {
        throw new ApiError(404, "Visitor entry not found.");
    }

    if (!visitorEntry.society.equals(guard.society)) {
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

    res.status(200).json({
        success: true,
        message: "Visitor checked out successfully.",
        visitorEntry,
    });
});