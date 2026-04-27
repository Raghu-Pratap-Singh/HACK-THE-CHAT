const mongoose = require("mongoose");

const interactionSchema = new mongoose.Schema(
  {
    userA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    userB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },

    replyCount: {
      type: Number,
      default: 0,
      min: 0
    },

    avgReplyTime: {
      type: Number,
      default: 0
    },

    last50AvgReplyTime: {
      type: Number,
      default: 0
    },

    recentReplyTimes: {
      type: [Number],
      default: []
    },

    lastInteractionAt: {
      type: Date,
      default: null
    },

    lastMessageAt: {
      type: Date,
      default: null
    },

    linkstrength: {
      type: Number,
      default: 1
    }
  },
  { timestamps: true }
);

// enforce ordering automatically
interactionSchema.pre("save", function (next) {
  if (this.userA.toString() > this.userB.toString()) {
    let temp = this.userA;
    this.userA = this.userB;
    this.userB = temp;
  }
  next;
});

// unique pair
interactionSchema.index(
  { userA: 1, userB: 1 },
  { unique: true }
);

module.exports = mongoose.model("interaction", interactionSchema);