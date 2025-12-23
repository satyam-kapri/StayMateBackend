import express from "express";
import cors from "cors";
import authRouter from "./src/routes/authRouter.js";
import morgan from "morgan";

const app = express();

// Middleware setup
app.use(morgan("dev"));
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/auth", authRouter);
app.get("/ping", (req, res) => {
  console.log("PING HIT");
  res.send("pong");
});
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
