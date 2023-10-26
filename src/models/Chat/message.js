const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: true,
    },
    chat: {
      type: mongoose.Schema.ObjectId,
      ref: "Chat",
      required: true,
    },

    message: {
      type: mongoose.Schema.ObjectId,
      ref: "Message",
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
