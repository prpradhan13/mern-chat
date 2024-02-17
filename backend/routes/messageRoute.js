import express from "express";
import { requireLogin } from "../middlewares/authMiddleware.js";
import {
  allMessageController,
  sendMessageController,
} from "../controllers/messageController.js";

const router = express.Router();

router.route("/").post(requireLogin, sendMessageController);
router.route("/:chatId").get(requireLogin, allMessageController);

export default router;
