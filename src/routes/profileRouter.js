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
  getQuestionsByCategory,
  getAllQuestions,
} from "../controllers/profileController.js";
import { handleUpload, upload } from "../middleware/multerUpload.js";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createQuestion,
  deleteQuestion,
  reorderQuestions,
  updateQuestion,
} from "../controllers/questionsController.js";

const profileRouter = Router();

profileRouter.get("/me", authMiddleware, getMyProfile);
profileRouter.get("/:userId", authMiddleware, getUserProfile);
profileRouter.get("/questions", authMiddleware, getAllQuestions);
profileRouter.get(
  "/questions/:category",
  authMiddleware,
  getQuestionsByCategory,
);
profileRouter.patch("/basic-info", authMiddleware, updateBasicInfo);
profileRouter.patch("/budget-location", authMiddleware, updateBudgetLocation);
profileRouter.patch("/lifestyle", authMiddleware, updateLifestyle);
profileRouter.patch("/bio", authMiddleware, updateBio);

profileRouter.post("/photo", authMiddleware, handleUpload(upload), uploadPhoto);
profileRouter.delete("/photo/:photoId", authMiddleware, deletePhoto);

profileRouter.post("/questions/create", authMiddleware, createQuestion);
profileRouter.patch("/questions/update", authMiddleware, updateQuestion);
profileRouter.delete("/questions/delete", authMiddleware, deleteQuestion);
profileRouter.patch("/questions/reorder", authMiddleware, reorderQuestions);

export default profileRouter;
