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
    const { userId } = req.params;
    const isChat = await Chat.findOne({
      $and: [
        { participants: { $elemMatch: { $eq: userId } } },
        { participants: { $elemMatch: { $eq: req.user._id } } },
      ],
    });
    if (isChat) {
      return ErrorHandler("Chat already exist", 400, req, res);
    }
    const chat = await Chat.create({
      participants: [userId, req.user._id],
    });
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
      .populate("participants")
      .populate("latestMessage");
    return SuccessHandler(
      { message: "Fetched chats successfully", chats },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

//Single Chats
const singleChat = async (req, res) => {
  // #swagger.tags = ['chat']
  try {
    const { chatId } = req.params;
    const chat = await Chat.findOne({
      _id: chatId,
      participants: { $in: [req.user._id] },
    })
      .populate("participants")
      .populate("latestMessage");
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
    const { chatId } = req.params;
    const { senderId, message } = req.body;
    const createMessage = await Message.create({
      sender: senderId,
      chat: chatId,
      message,
    });
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
      .populate("participants")
      .populate("latestMessage");
    return SuccessHandler(
      { message: "Message fetched successfully", messages },
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
