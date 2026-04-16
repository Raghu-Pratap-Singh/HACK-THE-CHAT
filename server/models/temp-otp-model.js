const mongoose = require("mongoose");

const otphandleSchema = new mongoose.Schema({
  email : String,
  temp_otp : Number,
  createdAt: { type: Date, default: Date.now, expires: 600 }
});


module.exports = mongoose.model("otphandle", otphandleSchema);