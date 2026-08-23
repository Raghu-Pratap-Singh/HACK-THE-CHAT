'use client'
import gsap from "gsap";
import React, { useEffect, useRef, useState, useContext } from "react"
import { Context } from '@/app/ContextAPI/Tools';
import { socket } from "@/app/socket"
import { useRouter } from "next/navigation";
import Link from "next/link";
import Error from "@/app/Components/Error";
function Nav({ adminid }) {
    let navref = useRef();
    let list_ref = useRef();
    let [isOn, setIsOn] = useState(false);
    const router = useRouter();
    let [fr, setFr] = useState([]);
    let route = process.env.NEXT_PUBLIC_HOMEROUTE;
    let user_route = process.env.NEXT_PUBLIC_USERROUTE;
    let { list, setList, online, setOnline, is_error, setIsError, error_text,  setErrorText} = useContext(Context);

    useEffect(() => {

        socket.on("new_friend_request", (user) => {
            setFr(prev => prev.includes(user) ? prev : [...prev, user]);
        });

        socket.on("decline_update", (user) => {
            setFr(prev => prev.filter(username => username !== user));
        });

        socket.on("accept_update", (user) => {
            setFr(prev => prev.filter(username => username !== user));

            setList(prev => {
                if (prev.some(friend => friend.username === user)) return prev;
                return [...prev, { username: user }];
            });
        });


        return () => {
            socket.off("new_friend_request");
            socket.off("decline_update");
            socket.off("accept_update");
        }

    }, [])

    // fetch friend requests
    useEffect(() => {
        const fetchRequests = async () => {
            try {
                let reqs = await fetch(`${user_route}/get_requests`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        adminid
                    })
                });

                const arr = await reqs.json();

                if (reqs.ok) {

                    let data = arr.usernames.map(person => person.username)
                    setFr(data || []);
                } else {
                    setErrorText(arr.error || "Failed to fetch requests")
                    setIsError(true)
                }
            } catch (err) {
                
                setErrorText('Server error')
                setIsError(true)
            }
        };

        if (adminid) fetchRequests();
    }, []);

    // GSAP animation
    useEffect(() => {
        if (navref.current) {
            gsap.fromTo(navref.current, {
                zIndex: -1,
            }, {
                delay: 3.7,
                zIndex: 4
            });

            gsap.fromTo(navref.current, {
                opacity: 0,
                y: -20,
            }, {
                opacity: 1,
                y: 0,
                delay: 4,
                duration: 0.5
            });
        }
    }, []);

    // this runs according to search friend bar emptiness


    function appear() {
        if (list_ref.current) {
            if (!isOn) {
                let t = gsap.timeline();
                t.to(list_ref.current, {
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-evenly",
                })
                t.to(list_ref.current, {
                    delay: -0.4,
                    opacity: 1,
                    duration: 0.2,
                    x: 10
                })
                setIsOn(true);

            }
            else {
                let t = gsap.timeline();
                t.to(list_ref.current, {
                    opacity: 0,
                    duration: 0.2,
                    x: -10
                })
                t.to(list_ref.current, {
                    display: "none",
                    delay: -0.4
                })
                setIsOn(false);
            }
        }
    }

    async function onAccept(username) {
        try {
            let request = await fetch(`${user_route}/accept_friend`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requester: username, master: adminid })
            })

            let data = await request.json();

            if (request.ok) {
                // means accepted successfully
                alert(`${username} added to friends list, now you can chat !!`);

                // add to list
                setList(prev => {
                    if (prev.some(friend => friend.username === username)) return prev;
                    return [{ username: username }, ...prev];
                });
                // remvove from friend_requests
                setFr(prev => prev.filter(item => item !== username));

            }
            else {
                setErrorText(data.error || "Some error occured")
                setIsError(true)
            }
        } catch (err) {
            setErrorText("Server error")
            setIsError(true)
        }
    }

    async function onDecline(username) {
        try {
            let request = await fetch(`${user_route}/decline_friend`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requester: username, master: adminid })
            })

            let data = await request.json();

            if (request.ok) {
                // means accepted successfully
                alert(`declined friend request of ${username}`);


                // remvove from friend_requests
                setFr(prev => prev.filter(item => item !== username));

            }
            else {
                setErrorText(data.error || "Some error occured")
                setIsError(true)
            }
        } catch (err) {
            setErrorText("Server error")
            setIsError(true)
        }

    }

    async function logout() {
        try {
            let res = await fetch(`${user_route}/logout/`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" }
            })
            let data = await res.json();
            if (res.ok) {
                // disconnect socket here
                if (socket) {
                    socket.disconnect();
                    // console.log("Socket disconnected manually.");
                }
                router.push("/Login");
            } else {
                setErrorText("Some error occured")
                setIsError(true)
            }
        } catch (err) {
            setErrorText("Server error")
            setIsError(true)
        }
    }
    const [isWide, setIsWide] = useState(false);

useEffect(() => {
    const handleResize = () => {
        setIsWide(window.innerWidth > 700);
    };

    handleResize(); // run once on mount
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
}, []);
    return (
        <div id="navbar" ref={navref}>
            <div id="friend_request">

                <div onClick={() => {
                    appear()
                }}>friend requests
                    {fr.length !== 0 && <div className="notify"></div>}</div>

            </div>
            <div id={"LEADERBOARD_LINK"} onClick={() => {
                router.push(`/Leaderboard/${adminid}`)
            }}>{isWide && "leaderboard" || "🏆"}</div>
            <div id="list" ref={list_ref}>
                {fr.length === 0 ? (
                    <p>No Friend Requests</p>
                ) : (
                    fr.map((user, index) => (
                        <div key={index} className="request_box">
                            <p>{user}</p>
                            <div>
                                <div className="accept_request_button" onClick={() => {
                                    onAccept(user)
                                }}>accept</div>
                                <div className="decline_request_button" onClick={() => {
                                    onDecline(user)
                                }}>decline</div>
                            </div>
                        </div>
                    ))
                )}
            </div>




            <div id="logout" onClick={() => {
                logout();
            }}>Logout</div>
        </div>
    );
}

export default Nav;
