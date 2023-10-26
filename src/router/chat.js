const router = require("express").Router();
const chat = require("../controllers/chatController");
const isAuthenticated = require("../middleware/auth");

router.route("/create").post(isAuthenticated, chat.createChat);
module.exports = router;
