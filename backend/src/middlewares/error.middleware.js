import ApiError from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
    console.error(err);

    // Custom API Error
    if (err instanceof ApiError) {
        const response = {
            success: false,
            message: err.message,
            errors: err.errors,
        };

        if (err.field) {
            response.field = err.field;
        }

        return res.status(err.statusCode).json(response);
    }

    // Mongoose Validation Error
    if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map((error) => ({
            field: error.path,
            message: error.message,
        }));

        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors,
        });
    }

    // Duplicate Key Error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];

        return res.status(409).json({
            success: false,
            message: `${field} already exists`,
            field,
        });
    }

    // Invalid Mongo ObjectId
    if (err.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: `Invalid ${err.path}`,
        });
    }

    // JWT Errors
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            success: false,
            message: "Invalid token",
        });
    }

    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            success: false,
            message: "Token expired",
        });
    }

    // Unknown Error
    return res.status(500).json({
        success: false,
        message:
            process.env.NODE_ENV === "production"
                ? "Internal Server Error"
                : err.message,
        stack:
            process.env.NODE_ENV === "production"
                ? undefined
                : err.stack,
    });
};

export default errorHandler;