import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js"
import { createSociety, getMySociety, getSociety, updateSociety } from "../controllers/society.controller.js";

const societyRouter = Router();

societyRouter.post("/create", authMiddleware, createSociety)
societyRouter.get("/my", authMiddleware, getMySociety)
societyRouter.get("/:societyId", getSociety)
societyRouter.get("/update", authMiddleware, updateSociety)

export default societyRouter;