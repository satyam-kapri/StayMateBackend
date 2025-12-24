import { Router } from "express";
import { verifyToken } from "../controllers/profileController.js";

const { Router } = require("express");
const {
  createProfile,
  listProfiles,
  getProfileById,
  getProfileByUserId,
  updateProfile,
  deleteProfile,
} = require("../controllers/profileController");

const router = Router();

// Create
router.post("/profiles", createProfile);

// List (filters: gender, area, minBudget, maxBudget)
router.get("/profiles", listProfiles);

// Get by profile id
router.get("/profiles/:id", getProfileById);

// Get by userId (1:1)
router.get("/users/:userId/profile", getProfileByUserId);

// Update (partial)
router.patch("/profiles/:id", updateProfile);

// Delete
router.delete("/profiles/:id", deleteProfile);

module.exports = router;


export default profileRouter;


