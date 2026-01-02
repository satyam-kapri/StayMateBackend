import express from "express";
import cors from "cors";
import authRouter from "./src/routes/authRouter.js";
import profileRouter from "./src/routes/profileRouter.js";
import matchesRouter from "./src/routes/matchesRoutes.js";
import chatRouter from "./src/routes/chatRouter.js";
import morgan from "morgan";
import http from "http";
import { initializeSocket } from "./src/socket.js";
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = initializeSocket(server);

// Make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Use chat routes

// Middleware setup
app.use(morgan("dev"));
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.use("/matches", matchesRouter);
app.use("/chat", chatRouter);
// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
