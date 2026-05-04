const express = require('express');
const router = express.Router();
const { isLoggedIn } = require("../middlewares/isLoggedIn")
const { get_chat, give } = require("../controllers/messageController");
router.post("/get_chat", isLoggedIn, get_chat);
router.post("/give_message", isLoggedIn, give);
module.exports = router