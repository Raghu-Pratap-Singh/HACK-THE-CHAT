'use client'
import gsap, { distribute } from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";
import React, { useEffect, useRef, useState, useContext, useDebugValue } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { socket } from "@/app/socket"
import { Context } from '@/app/ContextAPI/Tools';

function Chat({ adminid }) {
    const [addsearchedUsers, setaddSearchedUsers] = useState([]);
    const [searchedUsers, setSearchedUsers] = useState([]);
    let [entry, setEntry] = useState("");
    let [e2, setE2] = useState("");
    let { list, setList, online, setOnline } = useContext(Context);
    let chatref = useRef();
    let displayref = useRef();
    let [nullname, setNullname] = useState("");
    let [chat_user, setChatUser] = useState("");
    let [messagelist, setMessagelist] = useState([]);
    let [message_text, setMessageText] = useState("");
    let inputref = useRef(null);
    const bottomRef = useRef(null);
    const shouldScrollBottom = useRef(true);
    let [mode, setMode] = useState(false);
    let [switchmode, setSwitchmode] = useState(1);
    let switchref = useRef(null);
    let friends_ref = useRef(null);
    let add_ref = useRef(null);
    let [istyping, setIstyping] = useState(false);
    const oldestTimeRef = useRef(null);
    let [pending_users, setPendingusers] = useState(new Set())
    let f_ref = useRef();

    let route = process.env.NEXT_PUBLIC_HOMEROUTE



    useEffect(() => {
        const handler = (username) => {
            console.log(username)
            setList(prev =>
                prev.filter(user => user.username !== username)
            )
        }

        const new_message_handler = (message_object) => {
            console.log(message_object);
            console.log(message_object)
            setMessagelist(prev => [...prev, message_object]);
        }


        const read_done_update = (data) => {
            let username = data.username;
            if (username != chat_user) {

                setPendingusers(prev => {
                    const updated = new Set(prev); // copy the set
                    updated.delete(username);      // remove the username
                    return updated;               // return new set
                });

            }

        }

        function new_pending_user_handler  (username)  {
            

                setPendingusers(prev => {
                    const updated = new Set(prev); // copy the set
                    updated.add(username);      // add new username to pending list
                    return updated;               // return new set
                });
            
            // shine animation here only as just new notification occured
            if (f_ref.current) {
                console.log("performing..")
                let t = gsap.timeline();
                t.to(f_ref.current, {
                    background:"linear-gradient(180deg,rgba(0, 255, 100, 0.5),rgba(0, 0, 0, 0.7))",
                    duration: 0.1,
                    
                });

                t.to(f_ref.current, {
                    background:"linear-gradient(180deg,rgba(0, 255, 100, 0.06),rgba(0, 0, 0, 0.75))",
                    duration: 0.1
                });
            }
        }


        socket.on("remove_update", handler);
        socket.on("new_message", new_message_handler);
        socket.on("update_pending_removal", read_done_update);
        socket.on("new_live_user", new_pending_user_handler);


        return () => {
            socket.off("remove_update", handler);
            socket.off("new_message", new_message_handler);
            socket.off("update_pending_removal", read_done_update);
            socket.off("new_live_user", new_pending_user_handler);

        }

    }, [])



    useEffect(() => {
        const blink_handler = (data) => {
            let opp = data.opposite_username
            let status = data.status

            if (chat_user && chat_user == opp) {
                if (status) {
                    setIstyping(true)
                } else {
                    setIstyping(false)
                }
            }
        }

        socket.on("know_blink", blink_handler);

        return () => {
            socket.off("know_blink", blink_handler);
        }

    }, [chat_user])


    useEffect(() => {
        const sendRequest = async () => {
            try {
                const req = await fetch(`${route}/users/fill`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        master: adminid
                    })
                });

                const data = await req.json();

                if (req.ok) {
                    setList(data.usernames);
                    setPendingusers(new Set(data.pending_arr));
                }
                else {
                    alert(data.error || "Some error occurred");
                }
            } catch (err) {
                console.error(err);
                alert("server error..");
            }
        };

        sendRequest();
    }, []);

    useEffect(() => {
        if (chatref.current) {
            gsap.fromTo(chatref.current, {
                zIndex: -1
            }, {
                delay: 4,
                zIndex: 3
            })
            gsap.fromTo(".outers", {
                opacity: 0,
                y: 60
            }, {
                delay: 4.2,
                duration: 0.8,
                opacity: 1,
                y: 0,
                ease: "power2.out",
                stagger: 0.4
            })

        }
        if (displayref.current) {
            gsap.fromTo(displayref.current, {
                opacity: 0,
                y: 50,
            }, {
                delay: 5,
                opacity: 1,
                duration: 0.7,
                opacity: 1,
                y: 0,
                ease: "power4.out"
            })
        }
        if (switchref.current) {
            gsap.fromTo(switchref.current, {
                opacity: 0
            }, {
                opacity: 1,
                delay: 5,
                duration: 0.2
            })
        }
    }, [])


    async function send_friend_request(username) {
        try {
            const res = await fetch(`${route}/users/send`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    senderId: adminid,
                    receiverUsername: username
                })
            });

            const data = await res.json();

            if (res.ok) {
                console.log("Request sent", data);
            } else {
                alert(data.error || "Failed to send request");
            }
        } catch (err) {
            console.error(err);
            alert("Server error");
        }
    }



    const handleadd = async (e) => {
        e.preventDefault();


        const username = e2.trim();

        if (!username) return;

        try {
            const res = await fetch(`${route}/users/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ username, master: adminid })
            });

            const data = await res.json();


            if (res.ok) {
                setaddSearchedUsers(data.users);

            } else {
                alert(data.error || "Some error occurred");
                setaddSearchedUsers([]);
            }

        } catch (err) {
            console.error(err);
            alert("Server error");
            setaddSearchedUsers([]);
        }
    };

    useEffect(() => {
        const query = entry.trim().toLowerCase();

        const newlist = list.filter(val =>
            val.username.toLowerCase().startsWith(query)
        );

        setSearchedUsers(newlist);
    }, [entry]);

    async function nullify() {
        try {
            let req = await fetch(`${route}/users/remove_friend`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ friend: nullname, master: adminid })
            })

            let data = await req.json();
            if (req.ok) {
                setList(prev =>
                    prev.filter(user => user.username !== nullname))
                setNullname("");
                setChatUser("");
            }
            else {
                alert(data.error || "Some error occurred");
                setNullname("");
                setChatUser("");
            }
        } catch (err) {
            console.error(err);
            alert("Server error");
            setNullname("");
            setChatUser("");

        }
    }

    // retrieve messages
    async function get_messages(username, before = null) {
        try {
            let res = await fetch(`${route}/messages/get_chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ sender: username, receiver: adminid, before })
            })

            let data = await res.json();
            if (res.ok) {
                let messages = data.messages;
                // format of messages will be {time:"", isAdmin : t/f, text:String}
                // this list will be sorted by time
                if (messages.length > 0) {
                    oldestTimeRef.current = messages[0].time;
                }
                console.log(messages)
                setMessagelist(prev => [...messages, ...prev]);


            } else {
                alert(data.error || "Some error occurred");
                setChatUser("");
            }
        } catch (err) {
            console.error(err);
            alert("Server error");
            setChatUser("");
        }
    }

    async function give() {
        try {
            let res = await fetch(`${route}/messages/give_message`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ sender: adminid, receiver: chat_user, content: message_text })
            })
            let data = await res.json();
            if (res.ok) {
                console.log("message delivered");
                setMessageText("");
            } else {
                alert(data.error || "Some error occurred");
                setMessageText("");
            }
            setMessageText("");
        } catch (err) {
            console.error(err);
            setMessageText("");
            alert("Server error...");
            setMessageText("");
        }
    }
    useEffect(() => {
        if (bottomRef.current && shouldScrollBottom.current) {
            bottomRef.current.scrollIntoView({
                behavior: messagelist.length <= 1 ? "auto" : "smooth"
            });
        }
        shouldScrollBottom.current = true;
    }, [messagelist]);

    // this function will run only if screen width<900px

    function trans(stat) {
        if (window.innerWidth > 900) return;

        let t = gsap.timeline();

        if (!stat) {
            // 🔙 Back to friends list

            t.to(displayref.current, {
                y: -10,
                opacity: 0,
                duration: 0.3
            })
                .set(displayref.current, {
                    display: "none"   // 
                })
                .set(chatref.current, {
                    display: "flex"   // 
                })
                .fromTo(chatref.current,
                    {
                        y: 10,
                        opacity: 0
                    },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.25
                    }
                );

        } else {
            //  Open chat

            t.to(chatref.current, {
                y: -10,
                opacity: 0,
                duration: 0.3
            })
                .set(chatref.current, {
                    display: "none"   // 
                })
                .set(displayref.current, {
                    display: "flex"   // 
                })
                .fromTo(displayref.current,
                    {
                        y: 10,
                        opacity: 0
                    },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.25
                    }
                );
        }
    }

    function switch_the_mode(val) {
        if (!val) {
            let t = gsap.timeline();
            t.to(friends_ref.current, {
                y: 10,
                opacity: 0,
                duration: 0.3,
                delay: -0.2
            })
            t.to(friends_ref.current, {
                display: "none"
            })

            t.to(add_ref.current, {
                display: "flex"
            })
            t.to(add_ref.current, {
                y: 0,
                opacity: 1,
                duration: 0.1,
                delay: -0.3
            })
        }
        else {
            let t = gsap.timeline();
            t.to(add_ref.current, {
                y: 10,
                opacity: 0,
                duration: 0.3,
                delay: -0.2
            })
            t.to(add_ref.current, {
                display: "none"
            })

            t.to(friends_ref.current, {
                display: "flex"
            })
            t.to(friends_ref.current, {
                y: 0,
                opacity: 1,
                duration: 0.1,
                delay: -0.3
            })
        }
    }



    function handle_blinker(prev, curr) {
        // if admin just started a new message with finite length
        if (prev == 0 && curr > 0) {

            socket.emit("blink", {
                status: true,
                chatter: chat_user,
                admin: adminid
            })
        }
        // if user just removed every thing in message bar
        else if (prev > 0 && curr == 0) {

            socket.emit("blink", {
                status: false,
                chatter: chat_user,
                admin: adminid
            })

        }
    }

    function handle_scroll(e) {
        if (e.target.scrollTop === 0 && chat_user) {
            shouldScrollBottom.current = false;
            get_messages(chat_user, oldestTimeRef.current);
        }
    }

    const formatDateTime = (iso) => {
        const date = new Date(iso);

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);

        const hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');

        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHour = String(hours % 12 || 12).padStart(2, '0');

        return `${day}/${month}/${year} ${formattedHour}:${minutes} ${ampm}`;
    };

    async function handle_read(username) {
        try {
            if (pending_users.has(username)) {
                // means just read pending messages
                socket.emit("update_pending", {
                    username,
                    adminid
                })
            }
        } catch (arr) {
            alert("Something went wrong")
        }
    }


    async function direct(username) {
        socket.emit("direct_chat", {
            adminid: adminid,
            username: username
        })
    }

    function cut_direct_link() {
        socket.emit("cut_link", adminid);
    }
    return (
        <>
            {nullname && <div id="nullify_confirmation">
                <div id="nullit">
                    <p>Are you sure you want to break link with {nullname}.</p>
                    <div id="null_options">

                        <button id="terminate" onClick={() => {
                            nullify();
                        }}>break link</button>
                        <button id="leave" onClick={() => {
                            setNullname("");
                        }}>retain connection</button>
                    </div>
                </div>
            </div>}

            {<div id="concurrent_chat">
                <h1>HACKED</h1>
            </div>}
            <div id="chat_layout">

                <div id="switch_point" ref={switchref} style={{ display: mode ? "none" : "block" }} onClick={() => {
                    const newMode = switchmode === 1 ? 0 : 1;
                    setSwitchmode(newMode);
                    switch_the_mode(newMode);
                }}>
                    {(switchmode && "add friend") || ("search friend")}
                </div>
                <div id="chat" ref={chatref}>
                    <div id="friends" className="outers" ref={friends_ref}>


                        <input id="search_friends" placeholder="search friend..." name="username" onChange={(e) => {
                            setEntry(e.target.value);
                        }}></input>

                        <div id="friends_list" ref={f_ref}>




                            {entry.length === 0
                                ? list.map((user, index) => (
                                    <div className="friend_bar" key={index}>
                                        {online.has(user.username) && <div className="isonline"></div>}
                                        {pending_users.has(user.username) && <div className="ispending"></div>}
                                        <p>{user.username}</p>
                                        <div>
                                            <div className="chat_with_friend" onClick={() => {

                                                setChatUser(user.username);
                                                setMessagelist([]);
                                                oldestTimeRef.current = null;
                                                get_messages(user.username);
                                                setMode(true);
                                                trans(true);
                                                handle_read(user.username)

                                                direct(user.username)

                                            }}>init link</div>

                                            <div className="mob_chat_with_friend" onClick={() => {
                                                setChatUser(user.username);
                                                setMessagelist([]);
                                                oldestTimeRef.current = null;
                                                get_messages(user.username);
                                                setMode(true);
                                                trans(true);
                                                handle_read(user.username)
                                                direct(user.username)
                                            }}></div>
                                            <div className="null" onClick={() => {
                                                setNullname(user.username);

                                            }}>nullify</div>
                                            <div className="mob_null" onClick={() => {
                                                setNullname(user.username);

                                            }}></div>
                                        </div>
                                    </div>
                                ))
                                : searchedUsers.map((user, index) => (
                                    <div className="friend_bar" key={index}>
                                        {online.has(user.username) && <div className="isonline"></div>}
                                        {pending_users.has(user.username) && <div className="ispending"></div>}
                                        <p>{user.username}</p>
                                        <div>
                                            <div className="chat_with_friend" onClick={() => {
                                                setChatUser(user.username);
                                                setMessagelist([]);
                                                oldestTimeRef.current = null;
                                                get_messages(user.username);
                                                setMode(true);
                                                trans(true);
                                                handle_read(user.username)
                                                direct(user.username)
                                            }}>init link</div>
                                            <div className="mob_chat_with_friend" onClick={() => {
                                                setChatUser(user.username);
                                                setMessagelist([]);
                                                oldestTimeRef.current = null;
                                                get_messages(user.username);
                                                setMode(true);
                                                trans(true);
                                                handle_read(user.username)
                                                direct(user.username)
                                            }}></div>
                                            <div className="null" onClick={() => {
                                                setNullname(user.username);

                                            }}>nullify</div>
                                            <div className="mob_null" onClick={() => {
                                                setNullname(user.username);

                                            }}></div>
                                        </div>
                                    </div>
                                ))
                            }

                        </div>
                    </div>

                    <div id="add_friends" className="outers" ref={add_ref}>


                        <div id="combo">


                            <input id="add_friends_input" placeholder="add friend..." name="username" onChange={(e) => {
                                setE2(e.target.value)
                            }}></input>

                            <button id="search_user" onClick={handleadd}>search</button>

                        </div>
                        <div id="add_friends_list">



                            {addsearchedUsers.map((user, index) => (
                                <div className="friend_bar" key={index}>
                                    {online.has(user.username) && <div className="isonline"></div>}
                                    <p>{user.username}</p>
                                    <div className="plus" onClick={() => send_friend_request(user.username)}>+</div>
                                </div>
                            ))}

                        </div>

                    </div>
                </div>



                <div id="chat_display" ref={displayref}>
                    {mode && <div id="chat_closer" onClick={() => {

                        setMode(false);
                        trans(false);

                        cut_direct_link();
                    }}>terminate link</div>}
                    <div id="cross_chat" onScroll={handle_scroll}>
                        {chat_user && messagelist.map((msg, index) => (
                            msg.isAdmin ? (
                                <div className="sender_message" key={index}>
                                    <p className="sender_message_content">{msg.text}
                                        <span className="message_time">{formatDateTime(msg.time)}</span>
                                    </p>

                                </div>
                            ) : (
                                <div className="receiver_message" key={index}>
                                    <p className="receiver_message_content">{msg.text}</p>
                                    <span className="receiver_message_time">{formatDateTime(msg.time)}</span>
                                </div>
                            )
                        ))}
                        <div ref={bottomRef}></div>
                    </div>
                    <form id="message_form" onSubmit={(e) => {
                        e.preventDefault()
                    }}>
                        {istyping && <div id="typing">
                            <div className="load_box"></div>
                            <div className="load_box"></div>
                            <div className="load_box"></div>
                            <div className="load_box"></div>
                        </div>}
                        <input id="message" placeholder="Send a message..." onChange={(e) => {
                            handle_blinker(message_text.length, e.target.value.length)
                            setMessageText(e.target.value);

                        }} ref={inputref}></input>
                        <div id="send" onClick={() => {

                            if (message_text.length > 0) {

                                give();
                                // this will forcefully cause blinker for opposite chatter to turn off as after sending a message the message text becomes 0 length
                                handle_blinker(1, 0)
                            }

                            inputref.current.value = "";
                        }}> Send </div>
                    </form>
                </div>
            </div>
        </>
    )
}

export default Chat;