import jwt from "jsonwebtoken";
import config from "../config/config.js";

export const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user.id
        },
        config.ACCESS_TOKEN_JWT_SECRET,
        {
            expiresIn: "15m"
        }
    );
};

export const verifyAccessToken = (token) => {
    return jwt.verify(token, config.ACCESS_TOKEN_JWT_SECRET);
};