import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

export const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            jti: crypto.randomUUID()
        },
        config.REFRESH_TOKEN_JWT_SECRET,
        {
            expiresIn: "7d"
        },
    );
};

export const verifyRefreshToken = (token) => {
    return jwt.verify(token, config.REFRESH_TOKEN_JWT_SECRET);
};
