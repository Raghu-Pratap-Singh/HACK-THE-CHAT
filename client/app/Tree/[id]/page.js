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
import { useParams } from "next/navigation";

function Tree() {
  const { id } = useParams();
  let [strong_links, setStrong] = useState([]);
  let [moderate_links, setModerate] = useState([]);
  let [weak_links, setWeak] = useState([]);

  let welcomeref = useRef();
  let treeroute = process.env.NEXT_PUBLIC_TREEROUTE;
  useEffect(() => {

    const get_tree = async () => {
      try {
        let res = await fetch(`${treeroute}/getlinks/${id}`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        })

        let data = await res.json();

        if (data.ok) {
          setStrong(data.strong);
          setModerate(data.moderate);
          setWeak(data.weak);
          console.log(data);
        } else {
          setStrong([]);
          setModerate([]);
          setWeak([]);
          alert("Server error")
          console.log(data.error);
        }
      } catch (err) {
        alert("Server error")
        console.error(err);
      }
    }
    get_tree();
  }, [])

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
  return (
    <>
      <Back />
      <div id="welcome" ref={welcomeref}>
        <h2>T</h2>
        <h2>R</h2>
        <h2>E</h2>
        <h2>E</h2>

      </div>

    <div id="connections">
      <div className="link"></div>
      <div className="link"></div>
      <div className="link"></div>
    </div>
      
    </>
  )
}

export default Tree;