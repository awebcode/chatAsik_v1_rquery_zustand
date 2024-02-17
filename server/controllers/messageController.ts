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
      .populate({
        path: "isReply.messageId",
        select: "content",
        populate: { path: "sender", select: "username pic email" },
      })
      .populate("sender", "username pic email")
      .populate("chat")
      .sort({ _id: -1 }) // Use _id for sorting in descending order
      .limit(limit)
      .skip(skip);

    const total = await Message.countDocuments({ chat: req.params.chatId });
    res.json({ messages, total, limit });
  } catch (error: any) {
    console.log({ error });
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
    return next(new CustomErrorHandler("Chat Id or content cannot be empty!", 400));
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
    if (!status || !chatId)
      return next(new CustomErrorHandler("Chat Id or status cannot be empty!", 400));

    const chat = await Chat.findById(chatId)?.populate("latestMessage");

    if (!chat || !chat.latestMessage) {
      return next(new CustomErrorHandler("Chat or latest message not found", 404));
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
      return next(new CustomErrorHandler("Chat Id  cannot be empty!", 400));
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
      {
        status: { $in: ["unseen", "delivered"] },
        // sender: { $ne: req.id }
      }
    ).updateMany({
      status: "seen",
    });
    res.status(200).json(updatedMessage);
  } catch (error) {
    next(error);
  }
};

//update all message status as delivered after reconnect/rejoin/login a user

export const updateChatMessageAsDeliveredController = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return next(new CustomErrorHandler("User Id cannot be empty!", 400));
    }

    // Find all chats where the user is a participant
    const chats = await Chat.find({ users: { $in: [userId] } }).populate("latestMessage");

    if (!chats || chats.length === 0) {
      return next(new CustomErrorHandler("No chats found for the user", 404));
    }

    // Update all messages in each chat
    const updatePromises = chats.map(async (chat: any) => {
      if (!chat.latestMessage) {
        return; // Skip chats without a latest message
      }
      // Update the latest message's status to "delivered"
      if (
        chat.latestMessage?.status === "unseen" &&
        chat.latestMessage?.sender.toString() !== req.id
      ) {
        await Message.findByIdAndUpdate(
          chat.latestMessage._id,
          { status: "delivered" },
          { new: true }
        );
        // console.log({ sender: req.id === chat.latestMessage?.sender.toString() });

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

///

//update message status as remove

export const updateMessageStatusAsRemove = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { messageId, status, chatId } = req.body;
    const prevMessage = await Message.findById({ _id: messageId });

    if (!status || !messageId || !chatId)
      return next(new CustomErrorHandler("Message Id or status cannot be empty!", 400));

    const chat = await Chat.findById(chatId)?.populate("latestMessage");
    if (chat?.latestMessage?._id.toString() === messageId) {
      return next(new CustomErrorHandler("You cannot remove the latestMessage", 400));
    }

    let updateMessage: any;

    if (status === "remove" || status === "reBack") {
      updateMessage = await Message.updateOne(
        { _id: messageId },
        { $set: { status, removedBy: status === "reBack" ? null : req.id } }
      );
    } else if (status === "removeFromAll") {
      await Message.findByIdAndDelete(messageId);
      return res.status(200).json({ success: true });
    }

    // Set the updatedAt field back to its previous value
    updateMessage.updatedAt = prevMessage?.updatedAt;

    res.status(200).json({ success: true, updateMessage });
  } catch (error) {
    next(error);
  }
};

//update message status as unsent

export const updateMessageStatusAsUnsent = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { messageId, status } = req.body;
    if (!status || !messageId)
      return next(new CustomErrorHandler("Message Id or status  cannot be empty!", 400));
    const updateMessage = await Message.updateOne(
      { _id: messageId },
      { $set: { status: "unsent", unsentBy: req.id, content: "unsent" } }
    );
    res.status(200).json({ success: true, updateMessage });
  } catch (error) {
    next(error);
  }
};

//update Chat status as Blocked/Unblocked

export const updateChatStatusAsBlockOrUnblock = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chatId, status } = req.body;
    if (!status || !chatId)
     return next(new CustomErrorHandler("chat Id or status  cannot be empty!", 400));
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatStatus: { status, updatedBy: req.id } },
      { new: true }
    );
    res.status(200).json({ success: true,status: updatedChat?.chatStatus?.status,updatedBy:req.id });
  } catch (error) {
    next(error);
  }
};

//reply Message

export const replyMessage = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chatId, messageId, content } = req.body;
    if (!chatId || !messageId || !content)
      return next(
        new CustomErrorHandler("messageId  or chatId or content cannot be empty!", 400)
      );
    let message: any = await Message.create({
      sender: req.id,
      isReply: { repliedBy: req.id, messageId },
      content,

      chat: chatId,
    });
    message = await message.populate("sender chat", "username pic");
    // message = await message.populate("chat")
    message = await User.populate(message, {
      path: "chat.users",
      select: "username pic email",
    });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });
    res.status(200).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

//edit message

export const editMessage = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { messageId, content } = req.body;
    if (!messageId || !content)
      return next(new CustomErrorHandler("messageId  or content cannot be empty!", 400));
    const editedChat = await Message.findByIdAndUpdate(
      messageId,
      {
        isEdit: { editedBy: req.id },
        content,
      },
      { new: true }
    );
    res.status(200).json({ success: true, editedChat });
  } catch (error) {
    next(error);
  }
};
