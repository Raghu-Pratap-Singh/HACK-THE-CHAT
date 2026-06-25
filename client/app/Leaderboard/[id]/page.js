'use client'
import gsap, { distribute } from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";
import React, { useEffect, useRef, useState, useContext, useDebugValue, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { socket } from "@/app/socket"
import { Context } from '@/app/ContextAPI/Tools';
import Back from "../../Components/Back";
import Loginfo from "@/app/Loginfo/page";
import { useParams } from "next/navigation";


function Leaderboard() {

    let logroute = process.env.NEXT_PUBLIC_LOGROUTE;
    let route = process.env.NEXT_PUBLIC_HOMEROUTE;


    let [badge, setBadge] = useState("");
    let [logscore, setLogscore] = useState(0);
    const { id } = useParams();
    const router = useRouter();
    let { list, setList, online, setOnline } = useContext(Context);
    let [leaders, setLeaders] = useState([]);

    useEffect(() => {
        // ensure socket is disconnected when entering leaderboard
        if (socket.connected) {
            socket.disconnect();
        }

        return () => {
            // do NOTHING on cleanup
            // profile page will handle reconnection
        };
    }, []);
    function roundTo(num, places) {
        const factor = Math.pow(10, places);
        return Math.round(num * factor) / factor;
    }
    useEffect(() => {


        const send_badge_request = async () => {


            try {
                let res = await fetch(`${logroute}/getlog/${id}`, {
                    method: "GET",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" }
                });

                let data = await res.json();

                if (res.ok) {
                    setBadge(`/${data.badge_url}.png`);
                    setLogscore(roundTo(data.score, 2));
                    console.log(data)
                } else {
                    setBadge("");
                    setLogscore(0);
                    console.log(data.error);
                }
            } catch (err) {
                console.error(err);
            }
        };

        const send_leaders_request = async () => {
            // this request will fetch top 200 people from db
            try {
                let res = await fetch(`${logroute}/getleaders`, {
                    method: "GET",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" }
                });

                let data = await res.json();
                if (res.ok) {
                    console.log(data)
                    setLeaders(
                        data.leaders.map(user => ({
                            name: user.username,
                            LOG: roundTo(user.logScore, 2),
                            badge: `/${user.level}.png`
                        }))
                    );
                }
                else {
                    setLeaders([]);
                    alert("Server error")
                }
            } catch (err) {
                alert("Server error")
            }
        };
        send_badge_request();
        send_leaders_request();
    }, []);

    let welcomeref = useRef();
    let lnavref = useRef();
    let leadersref = useRef();
    useEffect(() => {

        if (welcomeref.current) {
            gsap.to("#welcome h2", {
                opacity: 1,
                delay: 0.4,
                duration: 1,
                stagger: 0.15
            })
            gsap.to("#welcome h2", {
                delay: 1.8,
                opacity: 0,
                duration: 1,
                stagger: 0.08
            })
            gsap.to("#welcome", {
                delay: 3.9,
                zIndex: -1
            })
        }

        if (lnavref.current) {
            gsap.to(lnavref.current, {
                delay: 4.2,
                opacity: 1,
                duration: 0.5
            })
        }
        if (leadersref.current) {
            gsap.to(leadersref.current, {
                delay: 4.4,
                display: "flex"
            })
            gsap.fromTo(leadersref.current, {
                y: 10
            }, {
                y: 0,
                opacity: 1,
                delay: 4.5,
                duration: 1
            })
        }

    }, [])

    return <>
        <Back />
        <div id="welcome" ref={welcomeref}>
            <h2>L</h2>
            <h2>E</h2>
            <h2>A</h2>
            <h2>D</h2>
            <h2>E</h2>
            <h2>R</h2>
            <h2>B</h2>
            <h2>O</h2>
            <h2>A</h2>
            <h2>R</h2>
            <h2>D</h2>

        </div>

        {/* MAIN PART HERE OF LEADERBOARD */}
        <div id="leaderboard_nav" ref={lnavref}>
            <button onClick={() => {
                router.push(`/Profile/${id}`);
            }} id="profile_backer">PROFILE</button>
            <Link href={"/Loginfo"}><h1 title="Click to understand LOG score">LOG : {logscore}</h1></Link>
            <img className="badge_img"
                src={`${badge}` || `/script_kiddie.png`}

            />

            <button onClick={() => {
                router.push(`/Tree/${id}`);
            }} id="tree">TREE</button>
        </div>

        <div id="leaders" ref={leadersref}>
            {leaders.map((user, index) => (
                <div className="leader_card" key={index}>
                    <div className="topper"></div>
                    <h2 className="leader_name">{user.name}</h2>
                    <div className="righter">
                        <h2 className="LOG_text">LOG : {user.LOG}</h2>
                        <img className="leader_img"
                            src={`${user.badge}`}

                        />
                    </div>
                </div>
            ))}
        </div>
    </>;
}

export default Leaderboard;