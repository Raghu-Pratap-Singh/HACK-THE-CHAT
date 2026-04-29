const express = require('express');
const { isLoggedIn } = require('../middlewares/isLoggedIn');
const { get_tree_links } = require('../controllers/treeController');
const router = express.Router();

router.get("/getlinks/:id", isLoggedIn, get_tree_links);

module.exports = router