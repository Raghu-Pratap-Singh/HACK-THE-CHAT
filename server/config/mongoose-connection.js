const mongoose = require("mongoose");
const dbgr = require("debug")("development:mongoose");
let uri = "";
if (process.env.NODE_ENV==="test") {
    uri = process.env.MONGODB_URI_TEST
} else {
    uri = process.env.MONGODB_URI
}
console.log(uri)
mongoose
    .connect(uri)
    .then(() => dbgr("connected"))
    .catch((err) => {dbgr(err)});

module.exports = mongoose.connection;