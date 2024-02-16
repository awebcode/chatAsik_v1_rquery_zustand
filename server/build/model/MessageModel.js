"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const messageSchema = new mongoose_1.default.Schema({
    sender: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, trim: true },
    chat: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Chat" },
    removedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    blockedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    status: {
        type: String,
        enum: [
            "seen",
            "unseen",
            "delivered",
            "remove",
            "removeFromAll",
            "unsent",
            "block",
            "unblock",
        ],
        default: "unseen",
    },
}, { timestamps: true });
exports.Message = mongoose_1.default.model("Message", messageSchema);
