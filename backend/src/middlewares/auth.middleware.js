import User from "../models/user.model.js";
import { verifyAccessToken } from "../utils/accessToken.js";
import { verifyRefreshToken } from "../utils/refreshToken.js";

const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res
            .status(401)
            .json({ message: "Unauthorized HTTP, Token not provided!" });
    }

    try {
        let decoded = verifyAccessToken(token);
        let user = await User.findById(decoded.id)

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("Error", error.message);
        res.status(500).json({
            message: "Something went wrong!",
            error: error.message,
        });
    }
}

export default authMiddleware;