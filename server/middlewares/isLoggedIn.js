const jwt = require("jsonwebtoken");
const userModel = require("../models/user-model");

const isLoggedIn = async (req, res, next) => {
  const tokenEntry = Object.entries(req.cookies).find(([key]) => key.startsWith("token_"));

  if (!tokenEntry) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const [, token] = tokenEntry;
    let decoded = jwt.verify(token, process.env.JWT_KEY);
    
    let person = await userModel
      .findOne({ email: decoded.email })
      .select("-password");
    
    if (!person) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = person;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports.isLoggedIn = isLoggedIn;