const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true
    },
    email: {
      type:String,
      required: true,
      unique:true
    },
    password: {
      type: String,
      required: true
    },

    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
      }
    ],

    profile_pic: {
      type: String,
      default: ""
    },
    isOnline :{
        type:Boolean,
        default:false
    },
    friend_requests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
      }
    ],
    pending : [
      {
        type: String,
        ref: "user"
      }
    ],
    //  LOG SYSTEM FIELDS

    totalTime: {
      type: Number,
      default: 0   // in seconds(float)
    },

    totalMessages: {
      type: Number,
      default: 0
    },

    gotMessages: {
      type: Number,
      default: 0   
    },

    logScore: {
      type: Number,
      default: 0
    },

    level: {
      type: String,
      enum: [
        "script_kiddie",
        "shell_user",
        "exploit_dev",
        "root",
        "kernel",
        "overlord"
      ],
      default: "script_kiddie"
    },

    lastActiveAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);
// Index for fast leaderboard queries
userSchema.index({ logScore: -1 });

module.exports = mongoose.model("user", userSchema);
