'use client';
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";
import React, { useContext, useEffect, useRef, useState } from "react"
import Link from "next/link"
import Back from "../../Components/Back";
import Nav from "@/app/Components/Nav";
import Chat from "@/app/Components/Chat";
import Error from "@/app/Components/Error";
import { useParams } from "next/navigation";
import { Context } from '@/app/ContextAPI/Tools';

import { socket } from "@/app/socket"
import { useRouter } from "next/navigation";
gsap.registerPlugin(useGSAP, ScrollTrigger);



function Profile() {
  const { id } = useParams();
  let welcomeref = useRef();
  let welcomerref = useRef();
  let headref = useRef()
  let { list, setList, online, setOnline, is_error} = useContext(Context);
  const router = useRouter();
  const [username, setUsername] = useState("");

  useEffect(() => {

    function onConnect() {
      console.log("connected socket", socket.id);

      // send user_id to backend
      socket.emit("joined", id);
    }

    function onDisconnect() {
      console.log("disconnected", socket.id);
    }

    function handleUpdatedUsers(data) {
      setOnline(new Set(data));
      console.log(data);
    }

    //  CONNECT when entering profile
    if (!socket.connected) {
      socket.connect();
    } else {
      // already connected (edge case)
      onConnect();
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("updated_users", handleUpdatedUsers);

    return () => {
      //  CLEAN listeners
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("updated_users", handleUpdatedUsers);

      //  DISCONNECT when leaving profile
      socket.disconnect();
    };

  }, [id]);

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_HOMEROUTE}/users/me`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        router.push("/Login");
      }
      console.log(data)
      setUsername(data.user.username);
    };
    checkAuth();
  }, []);

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
        stagger: 0.15
      })
      gsap.to("#welcome", {
        delay: 3.3,
        zIndex: -1
      })
    }


  }, [])

  useEffect(()=>{
    if (username && username.length>0) {
      // play animation after 5.6 seconds
      let t = gsap.timeline()
      if (welcomerref.current) {
        console.log("playing")
        t.to(welcomerref.current, {
          opacity:1,
          delay:5.2,
          duration:0.4,

        })
        t.to(headref.current, {
          
          opacity:1,
          duration:0.3,
          delay:0.3
        })
        t.to(headref.current, {
          
          opacity:0,
          duration:0.4,
          delay:1
        })
        t.to(welcomerref.current, {
          opacity:0,
          duration:0.7,
          delay:0.1
        })
        t.to(welcomerref.current, {
          zIndex:-1
        })
      }
      
    }
  },[username])

  return (
    <>
      {is_error && <Error/>}
      <Back />

      <Nav adminid={id} />
      <div id="welcome" ref={welcomeref}>
        <h2>P</h2>
        <h2>R</h2>
        <h2>O</h2>
        <h2>F</h2>
        <h2>I</h2>
        <h2>L</h2>
        <h2>E</h2>

      </div>
      <div id="welcomer" ref={welcomerref}>
        <h1 ref={headref}>Welcome {username}</h1>
      
      </div>
      <Chat adminid={id} />
    </>
  )
}
export default Profile;