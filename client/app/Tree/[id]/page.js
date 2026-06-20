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
  let link_ref = useRef();
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
        } else {
          setStrong([]);
          setModerate([]);
          setWeak([]);
          alert("Server error")
        }
      } catch (err) {
        alert("Server error")
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

  useEffect(() => {
    if (link_ref.current) {
      gsap.to(link_ref.current, {
        delay: 4,
        duration: 0.7,
        opacity: 1,
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

      <div id="connections" ref={link_ref}>
        <div className="link">
          <h1>STRONG LINKS
            <div className="link_dot"></div>
          </h1>
          {/* <div className="branch"></div>
        <div className="link_name">Raghu</div>
        <div className="branch"></div>
        <div className="link_name">Raghu</div>
        <div className="branch"></div>
        <div className="link_name">Raghu</div> */}
        {strong_links.map((user, index) => (
          <React.Fragment key={index}>
            <div className="branchw"></div>
            <div className="link_name">{user}</div>
          </React.Fragment>
        ))}
        </div>
        <div className="link">
          <h1>MODERATE LINKS

            <div className="link_dot"></div>
          </h1>
          {/* <div className="branchm"></div>
        <div className="link_name">Raghu</div>
        <div className="branchm"></div>
        <div className="link_name">Raghu</div>
        <div className="branchm"></div>
        <div className="link_name">Raghu</div> */}
        {moderate_links.map((user, index) => (
          <React.Fragment key={index}>
            <div className="branchw"></div>
            <div className="link_name">{user}</div>
          </React.Fragment>
        ))}
        </div>
        <div className="link">
          <h1>WEAK LINKS

            <div className="link_dot"></div>
          </h1>
          {/* <div className="branchw"></div>
        <div className="link_name">Raghu</div>
        <div className="branchw"></div>
        <div className="link_name">Raghu</div>
        <div className="branchw"></div>
        <div className="link_name">Raghu</div> */}
        {weak_links.map((user, index) => (
          <React.Fragment key={index}>
            <div className="branchw"></div>
            <div className="link_name">{user}</div>
          </React.Fragment>
        ))}
        </div>
      </div>

    </>
  )
}

export default Tree;