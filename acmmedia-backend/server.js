require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();

// Request logger for debugging Render/Routing issues
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Robust CORS configuration
// app.use(cors({
//     origin: ["http://localhost:5173", "https://acmmedia-frontend.vercel.app", "https://acmmedia-frontend.vercel.app"],
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true
// }));
app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
    console.log("Server: Health Ok")
    return res.send("Server: Health OK")
})

app.get("/api", (req, res) => {
    console.log("API: Health Ok")
    return res.send("API: Health OK")
})

app.get("/api/v1", (req, res) => {
    console.log("API v1: Health Ok")
    return res.send("API v1: Health OK")
})

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Static folder for uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/posts", require("./routes/posts"));
app.use("/api/v1/comments", require("./routes/comments"));
app.use("/api/v1/forum", require("./routes/forum"));
app.use("/api/v1/events", require("./routes/events"));
app.use("/api/v1/admin", require("./routes/admin"));
const newsRouter = require("./routes/news");
app.use("/api/v1/news", newsRouter);
app.use("/api/v1/external-news", newsRouter);
app.use("/api/v1/upload", require("./routes/upload"));

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        const server = app.listen(PORT, () => console.log(`Server active on port ${PORT}`));

        // Initialize Socket.IO after the HTTP server is ready.
        require("./socket").init(server);
    } catch (err) {
        console.error("Server startup failed:", err.message);
        process.exit(1);
    }
};

startServer();
