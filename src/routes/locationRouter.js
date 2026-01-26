import {
  getAllLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  getAllLocationsAdmin,
} from "../controllers/locationController.js";
import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// Public routes
router.get("/", getAllLocations);

// Admin routes
router.get("/admin/all", authMiddleware, getAllLocationsAdmin);
router.post("/admin", authMiddleware, createLocation);
router.put("/admin/:id", authMiddleware, updateLocation);
router.delete("/admin/:id", authMiddleware, deleteLocation);

export default router;
