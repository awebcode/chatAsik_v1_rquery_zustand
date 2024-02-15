import express from "express";
import authMiddleware from "../middlewares/authMiddleware";
import {
  allMessages,
  sendMessage,
  updateAllMessageStatusDelivered,
  updateAllMessageStatusSeen,
  updateChatMessageAsDeliveredController,
  updateChatMessageController,
} from "../controllers/messageController";

const messageRoute = express.Router();

messageRoute.route("/allmessages/:chatId").get(authMiddleware, allMessages);
messageRoute.route("/sentmessage").post(authMiddleware, sendMessage);
messageRoute
  .route("/updateMessageStatus")
  .patch(authMiddleware, updateChatMessageController);
messageRoute
  .route("/updateMessageStatusSeen/:chatId")
  .put(authMiddleware, updateAllMessageStatusSeen);
// messageRoute
//   .route("/updateMessageStatusDelivered/:chatId")
//   .put(authMiddleware, updateAllMessageStatusDelivered);
//update All messages status after rejoin a user
messageRoute
  .route("/updateMessageStatusDelivered/:userId")
  .put(authMiddleware, updateChatMessageAsDeliveredController);
export default messageRoute;
