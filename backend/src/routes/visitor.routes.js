import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js"
import { approveVisitor, createPreApprovedVisitor, createVisitor, getVisitors, markVisitorEntry, markVisitorExit, rejectVisitor } from "../controllers/visitor.controller.js";

const visitorRouter = Router();

visitorRouter.get("/", getVisitors);
visitorRouter.post("/create", createVisitor);
visitorRouter.post("/pre-approvals", createPreApprovedVisitor);
visitorRouter.patch("/entries/:entryId/approve", approveVisitor);
visitorRouter.patch("/entries/:entryId/reject", rejectVisitor);
visitorRouter.patch("/entries/:entryId/check-in", markVisitorEntry);
visitorRouter.patch("/entries/:entryId/check-out", markVisitorExit);

export default visitorRouter;