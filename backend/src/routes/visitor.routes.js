import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js"
import { approveVisitor, createPreApprovedVisitor, createVisitor, getVisitors, markVisitorEntry, markVisitorExit, rejectVisitor } from "../controllers/visitor.controller.js";

const visitorRouter = Router();

visitorRouter.get("/", authMiddleware, getVisitors);
visitorRouter.post("/create", authMiddleware, createVisitor);
visitorRouter.post("/pre-approvals", authMiddleware, createPreApprovedVisitor);
visitorRouter.patch("/entries/:entryId/approve", authMiddleware, approveVisitor);
visitorRouter.patch("/entries/:entryId/reject", authMiddleware, rejectVisitor);
visitorRouter.patch("/entries/:entryId/check-in", authMiddleware, markVisitorEntry);
visitorRouter.patch("/entries/check-in", authMiddleware, markVisitorEntry);
visitorRouter.patch("/entries/:entryId/check-out", authMiddleware, markVisitorExit);

export default visitorRouter;