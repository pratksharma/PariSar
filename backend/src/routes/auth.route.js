import { Router } from "express";
import { getUser, loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js"

const authRouter = Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.post("/refresh-access-token", refreshAccessToken);
authRouter.get("/get-user", authMiddleware, getUser);
authRouter.get("/logout", authMiddleware, logoutUser);

export default authRouter;