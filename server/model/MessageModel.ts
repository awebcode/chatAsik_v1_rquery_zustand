import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, trim: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    removedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    blockedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
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
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
