const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const userModel = require("../models/user-model");
const {get_level, get_log_score} = require("../utils/logScore")
const { Server } = require("socket.io");
let io;


let online_users = new Map();
let online_users_names = new Map();
let usersocket = new Map();
// this will have { user_id : [all socket ids belonging to this user (multiple tab case)]}
let usernameToId = new Map();
const sessionStart = new Map(); // userId → timestamp
const client_port = process.env.CLIENT_PORT

const directed_chat = new Map();

function initSocket(server) {


    io = new Server(server, {
        cors: {
            origin: client_port,
            credentials: true
        }
    });



    io.on("connection", (socket) => {


        console.log("connected:", socket.id);

        socket.on("disconnect", async () => {
            if (!socket.user_id) return;
            let user_id = socket.user_id;
            online_users.set(
                user_id,
                Math.max(0, online_users.get(user_id) - 1)
            );


            if (online_users.get(user_id) === 0) {
                let username = online_users_names.get(user_id);
                online_users.delete(user_id);
                usersocket.delete(user_id);
                online_users_names.delete(user_id);
                usernameToId.delete(username);
                // record active time here as this is the last tab disconnect
                let start = sessionStart.get(user_id);

                if (start) {
                    let active_time = Math.floor(Date.now() / 1000) - start;
                    let active_seconds = active_time;
                    // we store active time in seconds in db


                    if (active_seconds > 0) { // cap
                        await userModel.updateOne(
                            { _id: user_id },
                            { $inc: { totalTime: active_seconds } }
                        );
                    }
                    // also update log score
                    let user = await userModel.findById(user_id);
                    let new_score = get_log_score(user);
                    let new_level = get_level(new_score);
                    await userModel.updateOne({_id : user_id}, {$set: {logScore : new_score, level : new_level}})
                    console.log("stayed for", active_seconds, "seconds")
                    sessionStart.delete(user_id);
                }
            } else {
                usersocket.set(
                    user_id,
                    usersocket.get(user_id).filter(val => val !== socket.id)
                );
            }

            const arr = [...online_users_names.values()];
            io.emit("updated_users", arr);
            console.log(usersocket);
            console.log("disconnected:", socket.id);

        });

        socket.on("joined", async (user_id) => {
            user_id = user_id.toString();
            let user = await userModel.findById(user_id);
            if (!user) return;
            // add timestamp of start(first tab connect)
            let username = user.username;

            usernameToId.set(username, user_id.toString());
            socket.user_id = user_id;


            if (online_users.has(user_id)) {
                online_users.set(user_id, online_users.get(user_id) + 1);
                usersocket.get(user_id).push(socket.id);

            }
            else {

                let username = user.username;
                online_users.set(user_id, 1);
                usersocket.set(user_id, [socket.id]);
                online_users_names.set(user_id, username);
                sessionStart.set(user_id, Math.floor(Date.now() / 1000));
                console.log("joined at :", sessionStart.get(user_id))
            }
            const arr = [...online_users_names.values()];
            console.log(usersocket)
            io.emit("updated_users", arr);
        })

        socket.on("blink", (data) => {
            let username = data.chatter
            let stat = data.status
            let adminid = data.admin
            if (!online_users.has(adminid)) {
                return;
            }
            if (!usernameToId.has(username)) {
                return;
            }

            // but if chatter is online, means both are online

            let chatter_id = usernameToId.get(username)
            let target_sockets = usersocket.get(chatter_id)

            io.to(target_sockets).emit("know_blink", {
                status: stat,
                opposite_username: online_users_names.get(adminid)
            })

        })

        socket.on("update_pending", async (data) => {
            try {
                await userModel.findOneAndUpdate(
                    { _id: data.adminid },
                    { $pull: { pending: data.username } }
                )
                let username = data.username;
                // aware all admin sockets to recieve this update
                let id = data.adminid.toString();
                if (online_users.has(id)) {

                    let targetsockets = usersocket.get(id);
                    io.to(targetsockets).emit("update_pending_removal", {username});
                }

            } catch (err) {
                console.error(err)
            }
        })

        socket.on("direct_chat", async (data)=>{
            let adminname = online_users_names.get(data.adminid.toString());
            let username = data.username;
            
            directed_chat.set(adminname, username);
            console.log(directed_chat);
            
        })

    })






    return io;
}

function getio() {
    if (!io) {
        return new Error("socket not connected");
    }
    return io;
}

function send_new_friend_request_notification(user_id, sender_name) {

    user_id = user_id.toString();

    if (!online_users.has(user_id)) {
        return;
    }

    let target_sockets = usersocket.get(user_id);

    io.to(target_sockets).emit("new_friend_request", sender_name);

    console.log("sent successfully...");
}

function decline_update_to_all_self_sockets(user_id, sender_name) {
    user_id = user_id.toString();

    if (!online_users.has(user_id)) {
        return;
    }

    let target_sockets = usersocket.get(user_id);

    io.to(target_sockets).emit("decline_update", sender_name);

    console.log("decline notification sent successfully");

}

function accept_update_to_all_self_sockets(user_id, sender_name, sender_id, user_name) {
    user_id = user_id.toString();
    sender_id = sender_id.toString();

    if (!online_users.has(user_id)) {
        return;
    }

    let target_sockets = usersocket.get(user_id);
    io.to(target_sockets).emit("accept_update", sender_name);

    if (online_users.has(sender_id)) {

        let sender_sockets = usersocket.get(sender_id);
        io.to(sender_sockets).emit("accept_update", user_name);
    }

    console.log("accept notification sent successfully");

}

function remove_friend_from_all_sockets(adminid, friendname) {
    if (!online_users.has(adminid)) {
        return;
    }

    let target_sockets = usersocket.get(adminid);
    io.to(target_sockets).emit("remove_update", friendname);


}

function new_message_alert(userid, message_object) {

    userid = userid.toString();


    if (!online_users.has(userid)) {

        return -1;
    }
    let target_sockets = usersocket.get(userid);
    io.to(target_sockets).emit("new_message", message_object);
    return 1;

}


// online status emitting function which will tell a user which of his/her friends are online

module.exports = { initSocket, getio, send_new_friend_request_notification, decline_update_to_all_self_sockets, accept_update_to_all_self_sockets, remove_friend_from_all_sockets, new_message_alert };