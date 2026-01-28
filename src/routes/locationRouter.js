// routes/locationRoutes.js
import express from "express";
import {
  createLocation,
  updateLocation,
  deleteLocation,
  getAllLocations,
  getLocation,
} from "../controllers/locationController.js";

import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/", authMiddleware, getAllLocations);
router.get("/:id", authMiddleware, getLocation);
router.post("/", authMiddleware, createLocation);
router.put("/:id", authMiddleware, updateLocation);
router.delete("/:id", authMiddleware, deleteLocation);
router.get("/:id/usage", checkLocationUsage);
export default router;
