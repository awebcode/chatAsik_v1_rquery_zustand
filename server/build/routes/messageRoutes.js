"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const messageController_1 = require("../controllers/messageController");
const messageRoute = express_1.default.Router();
messageRoute.route("/allmessages/:chatId").get(authMiddleware_1.default, messageController_1.allMessages);
messageRoute.route("/sentmessage").post(authMiddleware_1.default, messageController_1.sendMessage);
messageRoute
    .route("/updateMessageStatus")
    .patch(authMiddleware_1.default, messageController_1.updateChatMessageController);
messageRoute
    .route("/updateMessageStatusSeen/:chatId")
    .put(authMiddleware_1.default, messageController_1.updateAllMessageStatusSeen);
// messageRoute
//   .route("/updateMessageStatusDelivered/:chatId")
//   .put(authMiddleware, updateAllMessageStatusDelivered);
//update All messages status after rejoin a user
messageRoute
    .route("/updateMessageStatusDelivered/:userId")
    .put(authMiddleware_1.default, messageController_1.updateChatMessageAsDeliveredController);
exports.default = messageRoute;
