// routes/locationRoutes.js
import express from "express";
import {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from "../controllers/locationController.js";

import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/", authMiddleware, getLocations);
router.post("/", authMiddleware, createLocation);
router.put("/:id", authMiddleware, updateLocation);
router.delete("/:id", authMiddleware, deleteLocation);

export default router;
