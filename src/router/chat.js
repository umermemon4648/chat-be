const router = require("express").Router();
const chat = require("../controllers/chatController");
const isAuthenticated = require("../middleware/auth");

router.route("/create").post(isAuthenticated, chat.createChat);
router.route("/fetch").get(isAuthenticated, chat.fetchChats);
router.route("/single").post(isAuthenticated, chat.singleChat);
router.route("/sendMessage").post(isAuthenticated, chat.sendMessage);
router.route("/fetchMessages/:chatId").get(isAuthenticated, chat.fetchMessages);
module.exports = router;
