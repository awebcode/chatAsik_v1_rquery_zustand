//@description     Create or fetch One to One Chat
//@route           POST /api/chat/

import { NextFunction, Request, Response } from "express";
import { CustomErrorHandler } from "../middlewares/errorHandler";
import { Chat } from "../model/ChatModel";
import { User } from "../model/UserModel";
import { Message } from "../model/MessageModel";

//@access          Protected
export const accessChat = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.body;

  if (!userId) {
    throw new CustomErrorHandler("Chat Id or content cannot be empty!", 400);
  }

  var isChat: any = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error: any) {
      next(error);
    }
  }
};

//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected
// export const fetchChats = async (
//   req: Request | any,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {

//      const limit = parseInt(req.query.limit) || 4;
//     const skip = parseInt(req.query.skip) || 0;
//      const keyword = req.query.search
//        ? {
//            $or: [
//              { username: { $regex: req.query.search, $options: "i" } },
//              { email: { $regex: req.query.search, $options: "i" } },
//            ],
//          }
//        : {};
//     Chat.find({ users: { $elemMatch: { $eq: req.id } } })
//       .populate("users", "-password")
//       .populate("groupAdmin", "-password")
//       .populate("latestMessage")
//       .sort({ updatedAt: -1 })
//       .then(async (results:any) => {
//         results = await User.populate(results, {
//           path: "latestMessage.sender",
//           select: "username pic email",
//         });
//         res.status(200).send({ users: results });
//       });
//   } catch (error: any) {
//     next(error);
//   }
// };

export const fetchChats = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const unseenMessagesCount = await Message.find({ status: "unseen" }).countDocuments();
    const limit = parseInt(req.query.limit) || 4;
    const skip = parseInt(req.query.skip) || 0;
    const keyword: any = req.query.search
      ? {
          $or: [
            { username: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    // Count the total documents matching the keyword
    const totalDocs = await Chat.countDocuments({
      users: { $elemMatch: { $eq: req.id } },
    });

    const chats = await Chat.find({
      users: { $elemMatch: { $eq: req.id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const populatedChats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "username pic email",
    });
    // Filter the populatedChats array based on the keyword
    let filteredChats: any = [];
    if (req.query.search && keyword) {
      filteredChats = populatedChats.filter((chat: any) =>
        chat.users.some(
          (user: any) =>
            user.username.match(new RegExp(keyword.$or[0].username.$regex, "i")) ||
            user.email.match(new RegExp(keyword.$or[1].email.$regex, "i"))
        )
      );
    }
    // const all = await Chat.find({
    //   users: { $elemMatch: { $eq: req.id } },
    // });
    // console.log({all})

    res.status(200).send({
      chats:
        filteredChats.length > 0 ? filteredChats : req.query.search ? [] : populatedChats,
      total:
        filteredChats.length > 0
          ? filteredChats.length
          : req.query.search
          ? 0
          : totalDocs,
      limit,
      unseenMessagesCount,
    });
  } catch (error: any) {
    console.log(error);
    next(error);
  }
};

//@description     Create New Group Chat
//@route           POST /api/chat/group
//@access          Protected
export const createGroupChat = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  if (!req.body.users || !req.body.name) {
    throw new CustomErrorHandler("Please Fill all the feilds!", 400);
  }

  var users = req.body.users
  

  if (users.length < 2) {
    return new CustomErrorHandler(
      "more than 2 users are required to form a group chat!",
      400
    );
  }

  users.push(req.id);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.id,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error: any) {
    console.log({ error });
    next(error);
  }
};

// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Protected
export const renameGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        chatName: chatName,
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      res.status(404);
      throw new CustomErrorHandler("Chat not found!", 404);
    } else {
      res.json(updatedChat);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove
// @access  Protected
export const removeFromGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chatId, userId } = req.body;

    // check if the requester is admin

    const removed = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!removed) {
      throw new CustomErrorHandler("Chat not found!", 404);
    } else {
      res.json(removed);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Add user to Group / Leave
// @route   PUT /api/chat/groupadd
// @access  Protected
export const addToGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { chatId, userId } = req.body;

    // check if the requester is admin

    const added = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!added) {
      throw new CustomErrorHandler("Chat not found!", 404);
    } else {
      res.json(added);
    }
  } catch (error) {
    next(error);
  }
};
