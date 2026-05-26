class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

const notFoundHandler = (req, res, next) => {
    next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Server error";

    if (statusCode >= 500) {
        console.error("Unhandled error:", err);
    }

    res.status(statusCode).json({
        success: false,
        message
    });
};

module.exports = {
    AppError,
    notFoundHandler,
    errorHandler
};