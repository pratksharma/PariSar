import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js"
import { createSociety } from "../controllors/society.controllor.js";

const societyRouter = Router();

societyRouter.post("/create", authMiddleware, createSociety)

export default societyRouter;