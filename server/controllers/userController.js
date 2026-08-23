const userModel = require("../models/user-model");
const messgeModel = require("../models/message-model");
const { send_new_friend_request_notification, decline_update_to_all_self_sockets, accept_update_to_all_self_sockets, remove_friend_from_all_sockets } = require("../socket/index")
async function search_friend(req, res) {
  try {
    const { username, master } = req.body;

    if (!username?.trim()) {
      return res.status(400).json({ error: "Username is required" });
    }

    const user = await userModel.findById(master);
    if (!user) {
      return res.status(404).json({ error: "Master user not found" });
    }

    const safe = username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const userlist = await userModel
      .find({ username: { $regex: safe, $options: "i" } })
      .select("username -_id")
      .limit(10);

    if (!userlist.length) {
      return res.status(404).json({ error: "No such user exists" });
    }

    // populate friends
    await user.populate({ path: "friends", select: "username -_id" });

    // create set of friend usernames
    const friendSet = new Set(user.friends.map(f => f.username));

    // filter friends + self
    const filtered = userlist.filter(u =>
      u.username !== user.username && !friendSet.has(u.username)
    );

    return res.json({
      ok: true,
      users: filtered
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error.." });
  }
}


async function add_friend(req, res) {
  try {
    const { senderId, receiverUsername } = req.body;

    if (!senderId || !receiverUsername) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const sender = await userModel.findById(senderId);
    if (!sender) {
      return res.status(404).json({ error: "Sender not found" });
    }

    const receiver = await userModel.findOne({ username: receiverUsername });
    if (!receiver) {
      return res.status(404).json({ error: "Receiver not found" });
    }

    //  self add
    if (sender._id.equals(receiver._id)) {
      return res.status(400).json({ error: "Cannot add yourself" });
    }


    const alreadyFriends = sender.friends.some(id =>
      id.equals(receiver._id)
    );
    if (alreadyFriends) {
      return res.status(400).json({ error: "Already friends" });
    }

    //  already requested
    const alreadyRequested = receiver.friend_requests.some(id =>
      id.equals(sender._id)
    );
    if (alreadyRequested) {
      return res.status(400).json({ error: "Request already sent" });
    }

    //  push request
    receiver.friend_requests.push(sender._id);
    await receiver.save();
    // emit an event to notify the reciver of new friend request
    send_new_friend_request_notification(receiver._id, sender.username);
    return res.json({
      ok: true,
      message: "Friend request sent"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}


async function get_friend_requests(req, res) {
  try {
    const { adminid } = req.body;
    let user = await userModel.findById(adminid);
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    await user.populate({ path: "friend_requests", select: "username -_id" });
    let arr = user.friend_requests;
    return res.status(200).json({ ok: true, usernames: arr })

  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}

async function accept(req, res) {
  try {
    let { requester, master } = req.body;
    if (!requester) return res.status(400).json({ error: "invalid requester" });
    if (!master) return res.status(400).json({ error: "invalid master" });
    let user = await userModel.findOne({ username: requester });
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }
    // else user fetched successfully
    let admin = await userModel.findById(master);
    if (!admin) {
      return res.status(404).json({ error: "admin not found" });
    }

    // else both fetched successfully

    admin.friends.push(user._id);
    user.friends.push(admin._id);

    // remove from friend requests
    admin.friend_requests = admin.friend_requests.filter(
      id => id.toString() !== user._id.toString()
    );
    accept_update_to_all_self_sockets(admin._id, user.username, user._id, admin.username);

    // also remove friend request of admin fom requesters friend_request if he had sentone
    user.friend_requests = user.friend_requests.filter(
      id => id.toString() !== admin._id.toString()
    );

    await user.save();

    await admin.save();

    return res.status(200).json({ ok: true });


  }
  catch (err) {
    return res.status(500).json({ error: "server error" })
  }
}


// remove friend route
async function decline(req, res) {
  try {
    let { requester, master } = req.body;

    if (!requester) {
      return res.status(404).json({ error: "user not found" });
    }
    if (!master) {
      return res.status(404).json({ error: "admin not found" });
    }

    let user = await userModel.findOne({ username: requester });
    let admin = await userModel.findById(master);

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }
    if (!admin) {
      return res.status(404).json({ error: "admin not found" });
    }


    // remove from friend requests
    admin.friend_requests = admin.friend_requests.filter(
      id => id.toString() !== user._id.toString()
    );
    decline_update_to_all_self_sockets(admin._id, user.username);

    // also remove friend request of admin fom requesters friend_request if he had sentone
    user.friend_requests = user.friend_requests.filter(
      id => id.toString() !== admin._id.toString()
    );

    await user.save();

    await admin.save();

    return res.status(200).json({ ok: true });

  } catch (err) {
    return res.status(500).json({ error: "server error" })

  }
}

async function fill(req, res) {
  try {
    let { master } = req.body;
    if (!master) {
      return res.status(404).json({ error: "invalid credentials" })
    }
    let user = await userModel.findById(master);
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    await user.populate([
      { path: "friends", select: "username level -_id" }
    ]);
    let arr = user.friends;
    let pending_arr = user.pending
    return res.status(200).json({ ok: true, usernames: arr, pending_arr })
  } catch (err) {
    return res.status(500).json({ error: "Server error" })
  }
}

async function remove_friend(req, res) {
  try {
    let { friend, master } = req.body;

    if (!friend) {
      return res.status(404).json({ error: "friend not found" });
    }
    if (!master) {
      return res.status(404).json({ error: "admin not found" });
    }

    let friend_user = await userModel.findOne({ username: friend });
    let admin = await userModel.findById(master);

    if (!friend_user) {
      return res.status(404).json({ error: "friend not found" });
    }
    if (!admin) {
      return res.status(404).json({ error: "admin not found" });
    }

    admin.friends = admin.friends.filter(id => !id.equals(friend_user._id));
    friend_user.friends = friend_user.friends.filter(id => !id.equals(admin._id));


    await admin.save();
    await friend_user.save();

    // also remove all messages from message model
    let deletedusers1 = await messgeModel.deleteMany({
      sender: admin._id,
      receiver: friend_user._id
    })
    let deletedusers2 = await messgeModel.deleteMany({
      receiver: admin._id,
      sender: friend_user._id
    })


    // send message to all sockets currently online to update in frontend
    remove_friend_from_all_sockets(admin._id.toString(), friend_user.username);
    remove_friend_from_all_sockets(friend_user._id.toString(), admin.username);


    return res.status(200).json({ ok: true });

  } catch (err) {
    return res.status(500).json({ error: "Server error" })
  }
}

async function get_mentioned_users(req, res) {
  try {
    let { username } = req.params;
    let users = await userModel.find({
      username : {
        $regex : `^${username}`,
        $options: "i"
      }
    }, {
      _id:0,
      username:1,
      level: 1,
      logScore: 1
    })
    users.forEach((val)=>{
      val.logScore = Math.round(val.logScore * 100)/100
    })
    console.log(users)
    return res.status(200).json({ok : true, users: users});
  } catch (err) {
    console.log(err);
    return res.status(500).json({error : "Something went wrong"});
  }
}

module.exports.fill = fill;
module.exports.accept = accept;
module.exports.decline = decline;
module.exports.search_friend = search_friend;
module.exports.add_friend = add_friend;
module.exports.get_friend_requests = get_friend_requests;
module.exports.remove_friend = remove_friend;
module.exports.get_mentioned_users = get_mentioned_users;


// SQL	MongoDB
// LIKE 'john%'	{ username: { $regex: "^john" } }
// LIKE '%john%'	{ username: { $regex: "john" } }
// LIKE '%john'	{ username: { $regex: "john$" } }