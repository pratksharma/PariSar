import Complaint from "../models/complaint.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

export const createComplaint = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    const user = req.user;

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required.");
    }

    if (!user.society) {
        throw new ApiError(400, "You are not part of any society.");
    }

    const complaint = await Complaint.create({
        society: user.society,
        resident: user._id,
        title,
        description,
    });

    res.status(201).json({
        success: true,
        message: "Complaint created successfully.",
        complaint,
    });
});

export const getComplaints = asyncHandler(async (req, res) => {
    const user = req.user;

    if (!user.society) {
        throw new ApiError(400, "You are not part of any society.");
    }

    let complaints;

    if (user.role === "admin") {
        complaints = await Complaint.find({
            society: user.society,
        })
            .populate("resident", "name flatNumber tower")
            .sort({ createdAt: -1 });
    } else {
        complaints = await Complaint.find({
            resident: user._id,
        }).sort({ createdAt: -1 });
    }

    res.json({
        success: true,
        complaints,
    });
});

export const deleteComplaint = asyncHandler(async (req, res) => {
    const { complaintId } = req.params;

    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
        throw new ApiError(404, "Complaint not found.");
    }

    if (!complaint.resident.equals(req.user._id)) {
        throw new ApiError(403, "You are not authorized to delete this complaint.");
    }

    if (complaint.status !== "open") {
        throw new ApiError(
            400,
            "Resolved complaints cannot be deleted."
        );
    }

    await complaint.deleteOne();

    res.json({
        success: true,
        message: "Complaint deleted successfully.",
    });
});

export const updateComplaintStatus = asyncHandler(async (req, res) => {
    const { complaintId } = req.params;
    const { status } = req.body;

    const user = req.user;

    if (user.role !== "admin") {
        throw new ApiError(403, "Only admins can update complaint status.");
    }

    if (!["open", "resolved"].includes(status)) {
        throw new ApiError(
            400,
            "Status must be either 'open' or 'resolved'.",
            "status"
        );
    }

    const complaint = await Complaint.findOne({
        _id: complaintId,
        society: user.society,
    });

    if (!complaint) {
        throw new ApiError(404, "Complaint not found.");
    }

    complaint.status = status;

    await complaint.save();

    res.json({
        success: true,
        message: "Complaint status updated successfully.",
        complaint,
    });
});