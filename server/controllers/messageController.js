const messageModel = require("../models/message-model");
const { new_message_alert } = require("../socket/index");
const userModel = require("../models/user-model");
const interactionModel = require("../models/interaction-model");
const { strength_calculator } = require("../utils/linkStrength");
const treeModel = require("../models/tree-model");
async function get_chat(req, res) {
    try {
        const { sender, receiver, before } = req.body;
        if (!sender) {
            return res.status(404).json({ error: "sender not found......" });
        }
        if (!receiver) {
            return res.status(404).json({ error: "receiver not found" });
        }

        let admin = await userModel.findById(receiver);
        let Sender = await userModel.findOne({ username: sender });
        if (!admin) {
            return res.status(404).json({ error: "admin not found" });
        }

        // get all message of admin
        const timeFilter = before ? { createdAt: { $lt: new Date(before) } } : {};

        let messagelist = await messageModel.find({
            sender: Sender._id,
            receiver: admin._id,
            ...timeFilter
        }).sort({ createdAt: -1 }).limit(20);

        let messagelist2 = await messageModel.find({
            sender: admin._id,
            receiver: Sender._id,
            ...timeFilter
        }).sort({ createdAt: -1 }).limit(20);

        let merged = [];
        for (let i = 0; i < messagelist.length; i++) {
            let element = messagelist[i];
            let object = {
                time: element.createdAt,
                isAdmin: false,
                text: element.text_content
            }
            merged.push(object);
        }
        for (let i = 0; i < messagelist2.length; i++) {
            let element = messagelist2[i];
            let object = {
                time: element.createdAt,
                isAdmin: true,
                text: element.text_content
            }
            merged.push(object);
        }
        merged.sort((a, b) => new Date(a.time) - new Date(b.time));
        // select latest 20
        const slice = merged.slice(-20);

        return res.status(200).json({ ok: true, messages: slice });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Server error" });
    }
}

async function give(req, res) {
    try {
        let { sender, receiver, content } = req.body;
        if (!sender) {
            return res.status(404).json({ error: "sender not found" });
        }
        if (!receiver) {
            return res.status(404).json({ error: "receiver not found" });
        }
        let user = await userModel.findOne({ username: receiver });
        if (!user) {
            return res.status(404).json({ error: "receiver not found" });

        }
        let admin = await userModel.findById(sender);
        if (!admin) {
            return res.status(404).json({ error: "sender not found" });

        }
        // get last message 
        const lastMessage = await messageModel.findOne({
            $or: [
                { sender: admin._id, receiver: user._id },
                { sender: user._id, receiver: admin._id }
            ]
        }).sort({ createdAt: -1 });

        let isReply = false;
        if (lastMessage && lastMessage.sender.toString() !== admin._id.toString()) {
            isReply = true;
        }

        // put in message model
        let message = await messageModel.create({
            sender: admin._id,
            receiver: user._id,
            text_content: content,
            image_content: ""
        })

        await userModel.findByIdAndUpdate(admin._id, {
            $inc: { totalMessages: 1 }
        });
        await userModel.findByIdAndUpdate(user._id, {
            $inc: { gotMessages: 1 }
        });


        let object1 = {
            time: message.createdAt,
            isAdmin: true,
            text: message.text_content
        }
        let object2 = {
            time: message.createdAt,
            isAdmin: false,
            text: message.text_content
        }

        // get last message between this pair
        let [userA, userB] = [admin._id.toString(), user._id.toString()].sort();

        const interaction = await interactionModel.findOne({
            userA,
            userB
        });
        // if this is first message, (no entry exists case)
        let currInteraction = interaction;

        if (!currInteraction) {
            currInteraction = await interactionModel.create({
                userA,
                userB,
                lastMessageAt: Date.now(),
            });
        } else {
            await interactionModel.updateOne(
                { userA, userB },
                { $set: { lastMessageAt: Date.now() } }
            );
            currInteraction = await interactionModel.findOne({
                userA, 
                userB
            });
        }
        
        // if reply happened
        if (isReply && lastMessage) {

            const replyTime = Date.now() - new Date(lastMessage.createdAt).getTime();

            // get current values
            let curr = currInteraction || {
                replyCount: 0,
                avgReplyTime: 0,
                recentReplyTimes: []
            };
            
            
            let newReplyCount = curr.replyCount + 1;
            
            let newAvg =
            curr.avgReplyTime +
            (replyTime - curr.avgReplyTime) / newReplyCount;
            
            
            let arr = [...(curr.recentReplyTimes || [])];
            
            arr.push(replyTime);
            
            if (arr.length > 50) {
                arr.shift();
            }
            
            // compute exact avg
            let sum = 0;
            for (let i = 0; i < arr.length; i++) {
                sum += arr[i];
            }
            
            let newLast50Avg = arr.length > 0 ? sum / arr.length : 0;
            
            // get strength level
            let ls = strength_calculator(newLast50Avg, newAvg);

            // update tree model of this user

            // first filter all tree arrays, strong, moderate and weak and remove this new opposite user if he or she is in it
            let admin_tree = await treeModel.findOne({userid : admin._id});
            let user_tree = await treeModel.findOne({userid : user._id});

            // admin array updates
            let admin_strong = admin_tree.strong;
            let admin_moderate = admin_tree.moderate;
            let admin_weak = admin_tree.weak;

            let up_admin_strong = admin_strong.filter((id)=>{
                id.toString()!==admin._id.toString();
            })

            let up_admin_moderate = admin_moderate.filter((id)=>{
                id.toString()!==admin._id.toString();
            })

            let up_admin_weak = admin_weak.filter((id)=>{
                id.toString()!==admin._id.toString();
            })

            // user array updates
            let user_strong = user_tree.strong;
            let user_moderate = user_tree.moderate;
            let user_weak = user_tree.weak;

            let up_user_strong = user_strong.filter((id)=>{
                id.toString()!==user._id.toString();
            })

            let up_user_moderate = user_moderate.filter((id)=>{
                id.toString()!==user._id.toString();
            })
            let up_user_weak = user_weak.filter((id)=>{
                id.toString()!==user._id.toString();
            })

            // add according to new score
            if (ls == 1) {
                // weak
                up_admin_weak.push(user._id)
                up_user_weak.push(admin._id)
            } else if (ls == 2) {
                // moderate
                up_admin_moderate.push(user._id)
                up_user_moderate.push(admin._id)
                
            } else if (ls == 3) {
                // strong
                up_admin_strong.push(user._id)
                up_user_strong.push(admin._id)
            }
            
            await treeModel.updateOne({
                userid : admin._id
            }, {
                strong: up_admin_strong,
                moderate: up_admin_moderate,
                weak: up_admin_weak
            })


            await treeModel.updateOne({
                userid : user._id
            }, {
                strong: up_user_strong,
                moderate: up_user_moderate,
                weak: up_user_weak
            })


            



            await interactionModel.updateOne(
                { userA, userB },
                {
                    $set: {
                        lastInteractionAt: Date.now(),
                        avgReplyTime: newAvg,
                        last50AvgReplyTime: newLast50Avg,
                        recentReplyTimes: arr,
                        linkstrength: ls
                    },
                    $inc: {
                        replyCount: 1
                    }
                }
            );

            console.log(`reply : ${replyTime}`);

        }


        // give live notification to sender's sockets and receiver's sockets
        new_message_alert(admin._id, object1);
        let response = new_message_alert(user._id, object2);

        if (response === -1) {
            // means receiver is not online
            await userModel.findByIdAndUpdate(user._id, {
                $addToSet: { pending: admin.username }
            })
            console.log(`${admin.username} added to pending`)
        }

        return res.status(200).json({ ok: true });


    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Server error" });
    }
}



module.exports.get_chat = get_chat;
module.exports.give = give;