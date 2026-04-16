const userModel = require("../models/user-model");
const otpModel = require("../models/temp-otp-model");
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/generateToken');
const { send_otp } = require("../utils/mailerTool")
const registerUser = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    

    let user = await userModel.findOne({ email: email });

    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        } else {
          let user = await userModel.create({
            username,
            email,
            password: hash
          });

          let token = generateToken(user);
          console.log(token)
          res.cookie(`token_${user._id}`, token, { httpOnly: true });
          return res.json({ ok: true , userid: user._id});
        }
      });
    });
  } catch (err) {
    return res.status(500).json({ error: "Register failed" });
  }
};

const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    let user = await userModel.findOne({ email: email });

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    } else {
      bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
          let token = generateToken(user);
          res.cookie(`token_${user._id}`, token, { httpOnly: true });
          return res.json({ ok: true , userid:user._id});
        } else {
          return res.status(400).json({ error: "Invalid credentials" });
        }
      });
    }
  } catch (err) {
    return res.status(500).json({ error: "Login failed" });
  }
};

const logout = async (req, res) => {
  res.clearCookie(`token_${req.user._id}`);
  return res.json({ ok: true });
};

const gen_OTP = async (req, res) => {
  try {
    let { email } = req.body;
    // generate otp here
    const otp = Math.floor(100000 + Math.random() * 900000);
    // generate a random otp and store it in a temporary map and send it to email recieved
    let response = await send_otp(email, otp);

    if (response.success === false) {
      // some error occured
      return res.status(400).json({error : "Some Error Occured"});
    }
    // No error, otp sent successfully
    // store temporarily in database
    let data = await otpModel.create({
      email : email,
      temp_otp : otp
    })
    return res.status(200).json({ok : true});

  } catch (err) {
    return res.status(500).json({error : "Server error"});
  }
}

const matcher = async (req, res) => {
  try {
    let { otp, email } = req.body;
    if (!otp) {
      return res.status(400).json({error : "bad request"});
    }
    // match otp with that in db to this email
    let otp_object = await otpModel.findOne({ email : email });
    if (!otp_object) {
      return res.status(404).json({ error : "Server error" });
    }
    if (otp_object.temp_otp === Number(otp)) {
      // otp matched,

      // delete this from data base
      await otpModel.deleteOne({email : email});
      return res.status(200).json({ok : true});
    }
    else {
      return res.status(500).json({error : "Invalid OTP"});
    }
  } catch (err) {
    return res.status(500).json({error : "Server error"});
  }
}
module.exports.registerUser = registerUser;
module.exports.loginUser = loginUser;
module.exports.logout = logout;
module.exports.gen_OTP = gen_OTP;
module.exports.matcher = matcher;
