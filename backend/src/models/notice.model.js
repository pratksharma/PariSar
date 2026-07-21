import mongoose from "mongoose";

const NoticeSchema = new mongoose.Schema(
    {
        society: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Society",
            required: true,
            index: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        tag: {
            type: String,
            enum: [
                "general",
                "maintenance",
                "security",
                "event",
                "emergency",
                "meeting",
                "payment",
                "other",
            ],
            default: "general",
        },

        issuedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Notice = mongoose.model("Notice", NoticeSchema);

export default Notice;