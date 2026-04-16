const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middlewares/isLoggedIn');

const { initial_badge_and_score, get_leaders } = require("../controllers/levelContoller");

// ROUTES
router.get("/getlog/:id", isLoggedIn, initial_badge_and_score);
router.get("/getleaders", get_leaders);

module.exports = router