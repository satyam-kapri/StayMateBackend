import { Router } from "express";
import { fakeAuth, verifyToken } from "../controllers/authController.js";
const authRouter = Router();

// Sample authentication route
authRouter.post("/verify-token", verifyToken);
authRouter.post("/fakeauth", fakeAuth);

export default authRouter;
