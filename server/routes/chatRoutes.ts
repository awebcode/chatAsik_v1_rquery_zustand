import express from "express";
import authMiddleware from "../middlewares/authMiddleware";
import { accessChat, addToGroup, createGroupChat, deleteSingleChat, fetchChats, removeFromGroup, renameGroup } from "../controllers/ChatController";


const chatRoute = express.Router();

chatRoute.route("/accessChats").post(authMiddleware, accessChat);
chatRoute.route("/fetchChats").get(authMiddleware, fetchChats);
chatRoute.route("/group").post(authMiddleware, createGroupChat);
chatRoute.route("/rename").put(authMiddleware, renameGroup);
chatRoute.route("/removefromgroup").put(authMiddleware, removeFromGroup);
chatRoute.route("/addtogroup").put(authMiddleware, addToGroup);
chatRoute.route("/deleteSingleChat/:chatId").delete(authMiddleware, deleteSingleChat);
export default chatRoute;