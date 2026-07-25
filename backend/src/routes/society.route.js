import { Router } from "express";
import authMiddleware, { optionalAuthMiddleware } from "../middlewares/auth.middleware.js";
import { acceptGuardInvite, approveRequest, createSociety, deleteSociety, getAllMembers, getGuardInvitations, getMySociety, getPendingRequests, getSociety, inviteGuard, joinSociety, rejectRequest, removeMember, updateSociety, verifyGuardInvite } from "../controllers/society.controller.js";

const societyRouter = Router();

societyRouter.post("/create", authMiddleware, createSociety);
societyRouter.get("/my", authMiddleware, getMySociety);
societyRouter.patch("/update", authMiddleware, updateSociety);
societyRouter.delete("/delete", authMiddleware, deleteSociety);
societyRouter.post("/join", authMiddleware, joinSociety);
societyRouter.get("/pending-requests", authMiddleware, getPendingRequests);
societyRouter.patch("/approve/:userId", authMiddleware, approveRequest);
societyRouter.patch("/reject/:userId", authMiddleware, rejectRequest);
societyRouter.delete("/remove/:userId", authMiddleware, removeMember);
societyRouter.get("/members", authMiddleware, getAllMembers);
societyRouter.post("/invite-guard", authMiddleware, inviteGuard);
societyRouter.get("/guard-invitations", authMiddleware, getGuardInvitations);
societyRouter.get("/verify-guard-invite/:inviteCode", verifyGuardInvite);
societyRouter.post("/accept-guard-invite", optionalAuthMiddleware, acceptGuardInvite);
societyRouter.get("/:societyId", getSociety);

export default societyRouter;