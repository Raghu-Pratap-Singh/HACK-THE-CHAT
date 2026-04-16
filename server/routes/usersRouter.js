const express = require('express');
const router = express.Router();
const {registerUser, loginUser, logout, gen_OTP, matcher}= require('../controllers/authController');
const { isLoggedIn } = require('../middlewares/isLoggedIn');
const { search_friend , add_friend, get_friend_requests, accept, decline, fill, remove_friend} = require("../controllers/userController");

// Public routes
router.post("/register", registerUser)
router.post("/login", loginUser)
router.post("/genotp", gen_OTP);
router.post("/matchotp", matcher);

// Protected routes
router.post("/logout", isLoggedIn, logout)
router.post("/add", isLoggedIn, search_friend)
router.post("/send", isLoggedIn, add_friend);
router.post("/get_requests", isLoggedIn, get_friend_requests);
router.post("/accept_friend", isLoggedIn, accept)
router.post("/decline_friend", isLoggedIn, decline)
router.post("/fill", isLoggedIn, fill)
router.post("/remove_friend", isLoggedIn, remove_friend);
router.get("/me", isLoggedIn, (req, res) => {
  res.status(200).json({ user: req.user });
});


module.exports = router