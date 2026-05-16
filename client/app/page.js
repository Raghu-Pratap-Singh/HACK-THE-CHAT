'use client'
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";
import React, { useEffect, useRef } from "react"
import Link from "next/link"
gsap.registerPlugin(useGSAP, ScrollTrigger);
import { useRouter } from "next/navigation";

import Back from "./Components/Back";
function Page() {
  const router = useRouter();
  let user_route = process.env.NEXT_PUBLIC_USERROUTE;
  let welcomeref = useRef();
  let introref = useRef();


  // on component mount, change the gradient after a delay of 1 sec
  useEffect(() => {
    // first check a request on backend to check for avilability of any token, if available, login directly to profile page
    const check = async () => {

      let res = await fetch(`${user_route}/already_logged_in`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      })

      let data = await res.json();
      
      if (data.ok) {
        // directly push profile page
        router.push(`/Profile/${data.user_id}`)
      }
      else {
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

        if (introref.current) {
          gsap.to("#intro", {
            delay: 3.5,
            zIndex: 2,
          })
          gsap.to("#intro h1", {
            opacity: 1,
            delay: 3.8,
            duration: 1
          })
          gsap.fromTo("#buttons a", {
            opacity: 0,

          }, {

            opacity: 1,
            delay: 4

          })
        }
      }

    }
    check();





  }, [])
  return (<>

    <div id="welcome" ref={welcomeref}>
      <h2>W</h2>
      <h2>E</h2>
      <h2>L</h2>
      <h2>C</h2>
      <h2>O</h2>
      <h2>M</h2>
      <h2>E</h2>
    </div>

    <Back />
    <div id="intro" ref={introref}>
      <h1>HACK THE CHAT</h1>
      <div id="buttons">
        <Link href={"/Login"}>Login</Link>
        <Link href={"/Create"}>Create Account</Link>
      </div>
    </div>
  </>)
}
export default Page