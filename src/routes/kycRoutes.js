import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import * as kycController from "../controllers/kycController.js";
import {
  handleUpload,
  uploadIDBack,
  uploadIDFront,
  uploadPoliceVerification,
  uploadSelfie,
} from "../middleware/multerUpload.js";

const kycRouter = Router();

// Step 1: Initialize KYC
kycRouter.post("/start", authMiddleware, kycController.startKYC);

// Step 2: Upload ID Front
// Note: 'image' is the key name you should use in your frontend FormData
kycRouter.post(
  "/upload/front",
  authMiddleware,
  handleUpload(uploadIDFront),
  kycController.uploadIDFront,
);

// Step 3: Upload ID Back
kycRouter.post(
  "/upload/back",
  authMiddleware,
  handleUpload(uploadIDBack),
  kycController.uploadIDBack,
);

// Step 4: Upload Police Verification
kycRouter.post(
  "/upload/police-verification",
  authMiddleware,
  handleUpload(uploadPoliceVerification),
  kycController.uploadPoliceVerification,
);

// Step 5: Upload Selfie
kycRouter.post(
  "/upload/selfie",
  authMiddleware,
  handleUpload(uploadSelfie),
  kycController.uploadSelfie,
);

// Step 5: Final Submission
kycRouter.post("/submit", authMiddleware, kycController.submitKYC);

// Get Current User's Status
kycRouter.get("/status", authMiddleware, kycController.getKYCStatus);

// ==========================================
// ADMIN ROUTES
// (Ideally, add an isAdmin middleware here)
// ==========================================

// Get Dashboard Stats
kycRouter.get("/stats", authMiddleware, kycController.getKYCStats);

// Get All KYCs (with pagination & filtering)
kycRouter.get("/all", authMiddleware, kycController.getAllKYCs);

// Get Specific KYC Details
kycRouter.get("/:id", authMiddleware, kycController.getKYCById);

// Approve KYC
kycRouter.put("/:id/approve", authMiddleware, kycController.approveKYC);

// Reject KYC
kycRouter.put("/:id/reject", authMiddleware, kycController.rejectKYC);

export default kycRouter;
