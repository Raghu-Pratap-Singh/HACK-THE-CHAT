const express = require('express');
const router = express.Router();
const { get_chat, give } = require("../controllers/messageController");
router.post("/get_chat", get_chat);
router.post("/give_message", give);
module.exports = router