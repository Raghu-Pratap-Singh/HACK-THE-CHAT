const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },

    text_content: {
      type: String,
      default: ""
    },

    image_content: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("message", messageSchema);
