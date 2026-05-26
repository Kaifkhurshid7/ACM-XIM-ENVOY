const { getAnalytics } = require("./services/analyticsService");
const jwt = require("jsonwebtoken");
const SECRET = require("./config/jwt");

let io;

module.exports = {
    init: (httpServer) => {
        io = require("socket.io")(httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST", "PUT", "DELETE"],
            },
        });
        console.log("Socket.IO initialized");

        io.on("connection", (socket) => {
            console.log(`New client connected: ${socket.id}`);

            // Join room based on role (simple implementation)
            socket.on("auth", (token) => {
                try {
                    const decoded = jwt.verify(token, SECRET);
                    if (decoded.role === 'admin') {
                        socket.join("admins");
                        console.log(`Admin joined: ${socket.id}`);
                    }
                } catch (err) {
                    console.error("Socket auth error:", err.message);
                }
            });

            socket.on("disconnect", () => {
                console.log(`Client disconnected: ${socket.id}`);
            });
        });

        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error("Socket.io not initialized!");
        }
        return io;
    },
    emitAnalytics: async () => {
        if (!io) return;
        const analytics = await getAnalytics();
        if (analytics) {
            // Emit only to admins
            io.to("admins").emit("analytics:update", analytics);
        }
    }
};
