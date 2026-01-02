import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import * as chatController from "../controllers/chatController.js";
const chatRouter = Router();
chatRouter.get("/", authMiddleware, chatController.getChats);
chatRouter.get("/:chatId/messages", authMiddleware, chatController.getMessages);
chatRouter.post(
  "/:chatId/messages",
  authMiddleware,
  chatController.sendMessage
);
chatRouter.post("/:chatId/read", authMiddleware, chatController.markRead);
export default chatRouter;
