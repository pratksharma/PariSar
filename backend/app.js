import express from "express";
import morgan from "morgan";
import authRouter from "./src/routes/auth.route.js";
import errorHandler from "./src/middlewares/error.middleware.js"
import societyRouter from "./src/routes/society.route.js";
import visitorRouter from "./src/routes/visitor.routes.js";
import noticeRouter from "./src/routes/notice.route.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev'));

app.use("/api/auth", authRouter)
app.use("/api/society", societyRouter)
app.use("/api/visitor", visitorRouter)
app.use("/api/notice", noticeRouter)

app.use(errorHandler)
export default app;