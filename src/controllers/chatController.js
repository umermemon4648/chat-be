const User = require("../models/User/user");
const Chat = require("../models/Chat/chat");
const Message = require("../models/Chat/message");
const sendMail = require("../utils/sendMail");
const SuccessHandler = require("../utils/SuccessHandler");
const ErrorHandler = require("../utils/ErrorHandler");

//create chat
const createChat = async (req, res) => {
  // #swagger.tags = ['chat']
  try {
    const { userId } = req.body;
    const isChat = await Chat.findOne({
      $and: [
        { participants: { $elemMatch: { $eq: userId } } },
        { participants: { $elemMatch: { $eq: req.user._id } } },
      ],
    })
      .populate("participants")
      .populate("latestMessage");

    if (isChat) {
      return ErrorHandler("Chat already exist", 400, req, res);
    }
    const createChat = await Chat.create({
      participants: [userId, req.user._id],
    });
    const chat = await Chat.findOne({ _id: createChat._id })
      .populate("participants")
      .populate("latestMessage");
    return SuccessHandler(
      { message: "Chat created successfully", chat },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

//get user chats
const fetchChats = async (req, res) => {
  // #swagger.tags = ['chat']
  try {
    const chats = await Chat.find({
      participants: { $in: [req.user._id] },
    })
      .populate({
        path: "participants",
        select: "name email profilePic _id",
      })
      .populate("latestMessage")
      .sort({ createdAt: -1 });
    if (chats.length === 0) {
      return ErrorHandler("chat not found", 404, req, res);
    }
    if (chats.length > 0) {
      for (const i of chats) {
        const unSeenCount = await Message.countDocuments({
          chats: i._id,
          isRead: false,
        });
        await Chat.findByIdAndUpdate(i._id, {
          unSeenCount: unSeenCount,
        });
      }
      return SuccessHandler(
        { message: "Fetched chats successfully", chats },
        200,
        res
      );
    }
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

//Single Chats
const singleChat = async (req, res) => {
  // #swagger.tags = ['chat']
  try {
    const { chatId } = req.body;
    const chat = await Chat.findOne({
      _id: chatId,
      participants: { $in: [req.user._id] },
    })
      .populate({
        path: "participants",
        select: "name email profilePic _id",
      })
      .populate("latestMessage")
      .sort({ createdAt: -1 });
    return SuccessHandler(
      { message: "Fetched chat successfully", chat },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
//send message to the user
const sendMessage = async (req, res) => {
  // #swagger.tags = ['chat']
  try {
    // const { chatId } = req.params;
    const { message, chatId } = req.body;
    let createMessage = await Message.create({
      sender: req.user._id,
      chat: chatId,
      message,
    });
    createMessage = await createMessage.populate({
      path: "sender",
      select: "name email profilePic _id",
    });
    createMessage = await createMessage.populate({
      path: "chat",
    });
    createMessage = await User.populate(createMessage, {
      path: "chat.participants",
      select: "name email profilePic _id",
    });
    await createMessage.save();
    const chat = await Chat.findById(chatId);
    await Chat.findOneAndUpdate(
      {
        _id: chatId,
      },

      {
        $set: {
          unSeenCount: chat.unSeenCount + 1,
          latestMessage: createMessage._id,
        },
      }
    );
    return SuccessHandler(
      { message: "Message send successfully", createMessage },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
//Fetch Messages
const fetchMessages = async (req, res) => {
  // #swagger.tags = ['chat']
  try {
    const { chatId } = req.params;
    // const { senderId } = req.body;
    const messages = await Message.find({
      chat: chatId,
    })
      .populate({
        path: "sender",
        select: "name email profilePic _id",
      })
      .populate("chat");
    return SuccessHandler(
      { message: "Messages fetched successfully", messages },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

module.exports = {
  createChat,
  fetchChats,
  singleChat,
  sendMessage,
  fetchMessages,
};
