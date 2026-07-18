class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        field = null
    ) {
        super(message);

        this.statusCode = statusCode;
        this.success = false;
        this.errors = errors;
        if (field) {
            this.field = field;
        }

        Error.captureStackTrace(this, this.constructor);
    }
}

export default ApiError