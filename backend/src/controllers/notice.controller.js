import Notice from "../models/notice.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createNotice = asyncHandler(async (req, res) => {
    const { title, description, tag } = req.body;

    if (!title?.trim() || !description?.trim()) {
        throw new ApiError(400, "Title and description are required.");
    }

    const user = req.user;

    if (user.role !== "admin") {
        throw new ApiError(403, "Only admins can issue notices.");
    }

    if (!user.society) {
        throw new ApiError(400, "You are not associated with any society.");
    }

    const notice = await Notice.create({
        society: user.society,
        title: title.trim(),
        description: description.trim(),
        tag,
        issuedBy: user._id,
    });

    return res.status(201).json({
        success: true,
        message: "Notice issued successfully.",
        notice,
    });
});

export const getNotices = asyncHandler(async (req, res) => {
    const user = req.user;

    if (!user.society) {
        throw new ApiError(400, "You are not associated with any society.");
    }

    const notices = await Notice.find({
        society: user.society,
    })
        .populate("issuedBy", "name")
        .sort({ createdAt: -1 });

    return res.status(200).json({
        success: true,
        message: "Notices fetched successfully.",
        notices,
    });
});

export const updateNotice = asyncHandler(async (req, res) => {
    if (req.user.role !== "admin") {
        throw new ApiError(403, "Only admins can update notices.");
    }

    const { title, description, tag } = req.body;

    const updates = {};

    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (tag !== undefined) updates.tag = tag;

    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "No fields provided to update.");
    }

    const notice = await Notice.findOneAndUpdate(
        {
            _id: req.params.id,
            society: req.user.society,
        },
        updates,
        {
            returnDocument: 'after',
            runValidators: true,
        }
    );

    if (!notice) {
        throw new ApiError(404, "Notice not found.");
    }

    return res.status(200).json({
        success: true,
        message: "Notice updated successfully.",
        notice,
    });
});

export const deleteNotice = asyncHandler(async (req, res) => {
    if (req.user.role !== "admin") {
        throw new ApiError(403, "Only admins can delete notices.");
    }

    const notice = await Notice.findOneAndDelete({
        _id: req.params.id,
        society: req.user.society,
    });

    if (!notice) {
        throw new ApiError(404, "Notice not found.");
    }

    return res.status(200).json({
        success: true,
        message: "Notice deleted successfully.",
    });
});