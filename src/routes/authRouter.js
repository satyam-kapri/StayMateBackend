import { Router } from "express";
import { verifyToken } from "../controllers/authController.js";
const authRouter = Router();

// Sample authentication route
authRouter.post("/verify-token", verifyToken);

export default authRouter;
