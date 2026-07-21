import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js"
import { createNotice, deleteNotice, getNotices, updateNotice } from "../controllers/notice.controller.js";

const noticeRouter = Router();

noticeRouter.post("/create", authMiddleware, createNotice);
noticeRouter.get("/get-notices", authMiddleware, getNotices);
noticeRouter.patch("/update/:id", authMiddleware, updateNotice);
noticeRouter.delete("/delete/:id", authMiddleware, deleteNotice);

export default noticeRouter;