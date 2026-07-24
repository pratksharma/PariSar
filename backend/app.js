import express from "express";
import morgan from "morgan";
import errorHandler from "./src/middlewares/error.middleware.js"
import authRouter from "./src/routes/auth.route.js";
import societyRouter from "./src/routes/society.route.js";
import visitorRouter from "./src/routes/visitor.routes.js";
import noticeRouter from "./src/routes/notice.route.js";
import complaintsRouter from "./src/routes/complaints.route.js";
import amenitiesRouter from "./src/routes/amenities.route.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev'));

app.use("/api/auth", authRouter)
app.use("/api/society", societyRouter)
app.use("/api/visitor", visitorRouter)
app.use("/api/notice", noticeRouter)
app.use("/api/complaints", complaintsRouter)
app.use("/api/amenities", amenitiesRouter)

app.use(errorHandler)
export default app;