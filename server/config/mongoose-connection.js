const mongoose = require("mongoose");
const dbgr = require("debug")("development:mongoose");
const uri = process.env.MONGODB_URI;

mongoose
    .connect(uri)
    .then(() => dbgr("connected"))
    .catch((err) => {dbgr(err)});

module.exports = mongoose.connection;