"use strict";
//@description     Get all Messages
//@route           GET /api/Message/:chatId
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateChatMessageAsDeliveredController = exports.updateAllMessageStatusDelivered = exports.updateAllMessageStatusSeen = exports.updateChatMessageController = exports.sendMessage = exports.allMessages = void 0;
const MessageModel_1 = require("../model/MessageModel");
const UserModel_1 = require("../model/UserModel");
const ChatModel_1 = require("../model/ChatModel");
const errorHandler_1 = require("../middlewares/errorHandler");
//@access          Protected
const allMessages = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const skip = parseInt(req.query.skip) || 0;
        const messages = yield MessageModel_1.Message.find({ chat: req.params.chatId })
            .populate("sender", "username pic email")
            .populate("chat")
            .sort({ updatedAt: -1 })
            .limit(limit)
            .skip(skip);
        const total = yield MessageModel_1.Message.countDocuments();
        res.json({ messages, total, limit });
    }
    catch (error) {
        next(error);
    }
});
exports.allMessages = allMessages;
//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { content, chatId } = req.body;
    if (!content || !chatId) {
        return new errorHandler_1.CustomErrorHandler("Chat Id or content cannot be empty!", 400);
    }
    var newMessage = {
        sender: req.id,
        content: content,
        chat: chatId,
    };
    try {
        var message = yield MessageModel_1.Message.create(newMessage);
        message = yield message.populate("sender chat", "username pic");
        // message = await message.populate("chat")
        message = yield UserModel_1.User.populate(message, {
            path: "chat.users",
            select: "username pic email",
        });
        yield ChatModel_1.Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
        res.json(message);
    }
    catch (error) {
        next(error);
    }
});
exports.sendMessage = sendMessage;
//update message status
const updateChatMessageController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { chatId, status } = req.body;
        console.log({ updateStatus: chatId, status });
        if (!status || !chatId)
            throw new errorHandler_1.CustomErrorHandler("Chat Id or status cannot be empty!", 400);
        const chat = yield ((_a = ChatModel_1.Chat.findById(chatId)) === null || _a === void 0 ? void 0 : _a.populate("latestMessage"));
        if (!chat || !chat.latestMessage) {
            throw new errorHandler_1.CustomErrorHandler("Chat or latest message not found", 404);
        }
        const updateMessage = yield MessageModel_1.Message.findByIdAndUpdate(chat.latestMessage._id, { status }, { new: true });
        const updateChat = yield ChatModel_1.Chat.findByIdAndUpdate(chatId, {
            latestMessage: updateMessage === null || updateMessage === void 0 ? void 0 : updateMessage._id,
        })
            .populate({
            path: "latestMessage",
            populate: { path: "sender", select: "username pic" },
        })
            .populate("users", "username pic");
        res.status(200).json({ success: true, chat: updateChat });
    }
    catch (error) {
        next(error);
    }
});
exports.updateChatMessageController = updateChatMessageController;
//update all messages status as seen
const updateAllMessageStatusSeen = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d;
    try {
        if (!req.params.chatId)
            throw new errorHandler_1.CustomErrorHandler("Chat Id  cannot be empty!", 400);
        const lastMessage = yield ChatModel_1.Chat.findById(req.params.chatId).populate("latestMessage");
        if (((_c = (_b = lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.latestMessage) === null || _b === void 0 ? void 0 : _b.sender) === null || _c === void 0 ? void 0 : _c.toString()) === req.id) {
            return;
        }
        yield ChatModel_1.Chat.findByIdAndUpdate(req.params.chatId, {
            latestMessage: (_d = lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.latestMessage) === null || _d === void 0 ? void 0 : _d._id,
        });
        const updatedMessage = yield MessageModel_1.Message.find({ chat: req.params.chatId }, { status: "unseen" }).updateMany({
            status: "seen",
        });
        res.status(200).json(updatedMessage);
    }
    catch (error) {
        next(error);
    }
});
exports.updateAllMessageStatusSeen = updateAllMessageStatusSeen;
//update all messages status as Delivered
const updateAllMessageStatusDelivered = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.params.chatId)
            throw new errorHandler_1.CustomErrorHandler("Chat Id  cannot be empty!", 400);
        const updatedMessage = yield MessageModel_1.Message.find({ chat: req.params.chatId }, { status: "unseen" }).updateMany({
            status: "delivered",
        });
        res.status(200).json(updatedMessage);
    }
    catch (error) {
        next(error);
    }
});
exports.updateAllMessageStatusDelivered = updateAllMessageStatusDelivered;
//update all message status as delivered after reconnect a user
const updateChatMessageAsDeliveredController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        console.log({ userId }, "updateChatMessageAsDeliveredController");
        if (!userId) {
            throw new errorHandler_1.CustomErrorHandler("User Id cannot be empty!", 400);
        }
        // Find all chats where the user is a participant
        const chats = yield ChatModel_1.Chat.find({ users: { $in: [userId] } }).populate("latestMessage");
        if (!chats || chats.length === 0) {
            throw new errorHandler_1.CustomErrorHandler("No chats found for the user", 404);
        }
        // Update all messages in each chat
        const updatePromises = chats.map((chat) => __awaiter(void 0, void 0, void 0, function* () {
            var _e;
            if (!chat.latestMessage) {
                return; // Skip chats without a latest message
            }
            // Update the latest message's status to "delivered"
            if (((_e = chat.latestMessage) === null || _e === void 0 ? void 0 : _e.status) === "unseen") {
                yield MessageModel_1.Message.findByIdAndUpdate(chat.latestMessage._id, { status: "delivered" }, { new: true });
                // Update the chat with the new latest message
                yield ChatModel_1.Chat.findByIdAndUpdate(chat._id, {
                    latestMessage: chat.latestMessage._id,
                });
            }
        }));
        // Wait for all updates to complete
        yield Promise.all(updatePromises);
        // Respond with success
        res.status(200).json({ success: true, message: "Messages updated as delivered" });
    }
    catch (error) {
        next(error);
    }
});
exports.updateChatMessageAsDeliveredController = updateChatMessageAsDeliveredController;
