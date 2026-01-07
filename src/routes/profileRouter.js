import { Router } from "express";
import {
  updateBasicInfo,
  updateBudgetLocation,
  updateLifestyle,
  uploadPhoto,
  deletePhoto,
  updateBio,
  getMyProfile,
  getUserProfile,
} from "../controllers/profileController.js";
import { upload } from "../middleware/multerUpload.js";
import authMiddleware from "../middleware/authMiddleware.js";

const profileRouter = Router();

profileRouter.get("/me", authMiddleware, getMyProfile);
profileRouter.get("/:userId", authMiddleware, getUserProfile);
profileRouter.patch("/basic-info", authMiddleware, updateBasicInfo);
profileRouter.patch("/budget-location", authMiddleware, updateBudgetLocation);
profileRouter.patch("/lifestyle", authMiddleware, updateLifestyle);
profileRouter.patch("/bio", authMiddleware, updateBio);

profileRouter.post("/photo", authMiddleware, upload, uploadPhoto);
profileRouter.delete("/photo/:photoId", authMiddleware, deletePhoto);

export default profileRouter;
