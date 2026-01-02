import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  getMatchFeed,
  respondToMatch,
  getConnectedMatches
} from "../controllers/matchesController.js";

const matchesRouter = Router();
matchesRouter.get("/feed", authMiddleware, getMatchFeed);
matchesRouter.post("/respond", authMiddleware, respondToMatch);
matchesRouter.get("/connected", authMiddleware, getConnectedMatches);

export default matchesRouter;