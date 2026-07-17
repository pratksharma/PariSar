import mongoose from "mongoose";

const SocietySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    uniqueCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },

    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    totalResidents: {
      type: Number,
      default: 1,
    },

    totalGuards: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Society = mongoose.model("Society", SocietySchema);

export default Society