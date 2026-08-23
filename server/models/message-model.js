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
    },
    mention: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);
// for finding latest message between two users
messageSchema.index({
  sender: 1,
  receiver: 1,
  createdAt: -1
});
module.exports = mongoose.model("message", messageSchema);
