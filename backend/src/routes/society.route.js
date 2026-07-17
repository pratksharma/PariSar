import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js"
import { acceptGuardInvite, approveRequest, createSociety, deleteSociety, getAllMembers, getMySociety, getPendingRequests, getSociety, inviteGuard, joinSociety, rejectRequest, removeMember, updateSociety } from "../controllers/society.controller.js";

const societyRouter = Router();

societyRouter.post("/create", authMiddleware, createSociety)
societyRouter.get("/my", authMiddleware, getMySociety)
societyRouter.get("/:societyId", getSociety)
societyRouter.patch("/update", authMiddleware, updateSociety)
societyRouter.delete("/delete", authMiddleware, deleteSociety)
societyRouter.post("/join", authMiddleware, joinSociety)
societyRouter.get("/pending-requests", authMiddleware, getPendingRequests)
societyRouter.patch("/approve/:userId", authMiddleware, approveRequest)
societyRouter.patch("/reject/:userId", authMiddleware, rejectRequest)
societyRouter.delete("/remove/:userId", authMiddleware, removeMember)
societyRouter.get("/members", authMiddleware, getAllMembers)
societyRouter.post("/invite-guard", authMiddleware, inviteGuard);
societyRouter.post("/accept-guard-invite", authMiddleware, acceptGuardInvite);

export default societyRouter;