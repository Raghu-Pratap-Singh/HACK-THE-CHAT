'use client'
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";
import React, { useEffect, useRef, useContext } from "react"
import Link from "next/link"
import { Context } from '@/app/ContextAPI/Tools';
function Back() {
    let backref = useRef();
    let { list, setList, online, setOnline } = useContext(Context);
    useEffect(()=>{
    if (backref.current) {
      gsap.fromTo(backref.current, {
        background : "linear-gradient(90deg, rgba(0,0,0,1),rgba(0,0,0,1), rgba(0,0,0,1), rgba(0,0,0,1), rgba(0,0,0,1))"
      },{
        background : "linear-gradient(90deg, rgba(0,0,0,1), rgba(0,0,0,0.6), rgba(0,0,0,0.4), rgba(0,0,0,0.6), rgba(0,0,0,1))",
        delay:2,
        duration:2,
        ease:"power2.in"
        
      })
    }

    
    
  },[])
    return (
        <>
        <div id="backer">
      
        <video
        id="bgvideo"
        autoPlay
        muted
        loop
        playsInline
        poster="/back.jpg"
      >
        {/* <source src="/back_vid.mp4" type="video/mp4" /> */}
      </video>
      <div id="blur_cover" ref={backref}>
      </div>
    </div>
        </>
    )
}
export default Back