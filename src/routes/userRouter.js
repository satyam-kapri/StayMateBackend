import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getUserStats,
  getAllProfiles,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const userRouter = express.Router();

// User management routes
userRouter.get("/users", authMiddleware, getAllUsers);
userRouter.get("/users/:id", authMiddleware, getUserById);
userRouter.put("/users/:id/status", authMiddleware, updateUserStatus);
userRouter.delete("/users/:id", authMiddleware, deleteUser);
userRouter.get("/stats/users", authMiddleware, getUserStats);

// Profile management routes
userRouter.get("/profiles", authMiddleware, getAllProfiles);

export default userRouter;
