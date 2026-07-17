import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js"
import { createSociety, getMySociety, getSociety } from "../controllors/society.controllor.js";

const societyRouter = Router();

societyRouter.post("/create", authMiddleware, createSociety)
societyRouter.get("/my", authMiddleware, getMySociety)

export default societyRouter;