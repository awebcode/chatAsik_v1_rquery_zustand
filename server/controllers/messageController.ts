//@description     Get all Messages
//@route           GET /api/Message/:chatId

import { NextFunction, Request, Response } from "express";
import { Message } from "../model/MessageModel";
import { User } from "../model/UserModel";
import { Chat } from "../model/ChatModel";
import { CustomErrorHandler } from "../middlewares/errorHandler";

//@access          Protected
export const allMessages = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "username pic email")
      .populate("chat")
      .sort({ updatedAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Message.countDocuments();
    res.json({ messages, total, limit });
  } catch (error: any) {
    next(error);
  }
};

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
export const sendMessage = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    return new CustomErrorHandler("Chat Id or content cannot be empty!", 400);
  }

  var newMessage = {
    sender: req.id,
    content: content,
    chat: chatId,
  };

  try {
    var message: any = await Message.create(newMessage);

    message = await message.populate("sender chat", "username pic");
    // message = await message.populate("chat")
    message = await User.populate(message, {
      path: "chat.users",
      select: "username pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error: any) {
    next(error);
  }
};
//update message status

export const updateChatMessageController = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chatId, status } = req.body;
    console.log({ updateStatus: chatId, status });
    if (!status || !chatId)
      throw new CustomErrorHandler("Chat Id or status cannot be empty!", 400);

    const chat = await Chat.findById(chatId)?.populate("latestMessage");

    if (!chat || !chat.latestMessage) {
      throw new CustomErrorHandler("Chat or latest message not found", 404);
    }

    const updateMessage = await Message.findByIdAndUpdate(
      chat.latestMessage._id,
      { status },
      { new: true }
    );

    const updateChat = await Chat.findByIdAndUpdate(chatId, {
      latestMessage: updateMessage?._id,
    })
      .populate({
        path: "latestMessage",
        populate: { path: "sender", select: "username pic" },
      })
      .populate("users", "username pic");

    res.status(200).json({ success: true, chat: updateChat });
  } catch (error) {
    next(error);
  }
};

//update all messages status as seen
export const updateAllMessageStatusSeen = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.params.chatId)
      throw new CustomErrorHandler("Chat Id  cannot be empty!", 400);
    const lastMessage: any = await Chat.findById(req.params.chatId).populate(
      "latestMessage"
    );

    if (lastMessage?.latestMessage?.sender?.toString() === req.id) {
      return;
    }

    await Chat.findByIdAndUpdate(req.params.chatId, {
      latestMessage: lastMessage?.latestMessage?._id,
    });
    const updatedMessage = await Message.find(
      { chat: req.params.chatId },
      { status: "unseen" }
    ).updateMany({
      status: "seen",
    });
    res.status(200).json(updatedMessage);
  } catch (error) {
    next(error);
  }
};

//update all messages status as Delivered
export const updateAllMessageStatusDelivered = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.params.chatId)
      throw new CustomErrorHandler("Chat Id  cannot be empty!", 400);
    const updatedMessage = await Message.find(
      { chat: req.params.chatId },
      { status: "unseen" }
    ).updateMany({
      status: "delivered",
    });
    res.status(200).json(updatedMessage);
  } catch (error) {
    next(error);
  }
};

//update all message status as delivered after reconnect a user

export const updateChatMessageAsDeliveredController = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    console.log({ userId }, "updateChatMessageAsDeliveredController");
    if (!userId) {
      throw new CustomErrorHandler("User Id cannot be empty!", 400);
    }

    // Find all chats where the user is a participant
    const chats = await Chat.find({ users: { $in: [userId] } }).populate("latestMessage");

    if (!chats || chats.length === 0) {
      throw new CustomErrorHandler("No chats found for the user", 404);
    }

    // Update all messages in each chat
    const updatePromises = chats.map(async (chat: any) => {
      if (!chat.latestMessage) {
        return; // Skip chats without a latest message
      }

      // Update the latest message's status to "delivered"
      if (chat.latestMessage?.status === "unseen") {
        await Message.findByIdAndUpdate(
          chat.latestMessage._id,
          { status: "delivered" },
          { new: true }
        );

        // Update the chat with the new latest message
        await Chat.findByIdAndUpdate(chat._id, {
          latestMessage: chat.latestMessage._id,
        });
      }
    });

    // Wait for all updates to complete
    await Promise.all(updatePromises);

    // Respond with success
    res.status(200).json({ success: true, message: "Messages updated as delivered" });
  } catch (error) {
    next(error);
  }
};
