import dotenv from "dotenv"

dotenv.config();

if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in environment variables")
}

if (!process.env.ACCESS_TOKEN_JWT_SECRET) {
    throw new Error("ACCESS_TOKEN_JWT_SECRET is not defined in environment variables")
}

if (!process.env.REFRESH_TOKEN_JWT_SECRET) {
    throw new Error("REFRESH_TOKEN_JWT_SECRET is not defined in environment variables")
}

const config = {
    MONGO_URI: process.env.MONGO_URI,
    ACCESS_TOKEN_JWT_SECRET: process.env.ACCESS_TOKEN_JWT_SECRET,
    REFRESH_TOKEN_JWT_SECRET: process.env.REFRESH_TOKEN_JWT_SECRET,
}

export default config;