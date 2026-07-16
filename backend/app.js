import express from "express";
import morgan from "morgan";
import authRouter from "./src/routes/auth.route.js";
import errorHandler from "./src/middlewares/error.middleware.js"

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev'));

app.use("/api/auth", authRouter)

app.use(errorHandler)
export default app;