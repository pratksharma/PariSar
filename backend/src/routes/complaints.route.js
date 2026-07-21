import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { createComplaint, getComplaints, deleteComplaint, updateComplaintStatus, } from "../controllers/complaints.controller.js";

const complaintsRouter = Router();

complaintsRouter.post("/", authMiddleware, createComplaint);
complaintsRouter.get("/", authMiddleware, getComplaints);
complaintsRouter.delete("/:complaintId", authMiddleware, deleteComplaint);
complaintsRouter.patch("/:complaintId/status", authMiddleware, updateComplaintStatus);

export default complaintsRouter;