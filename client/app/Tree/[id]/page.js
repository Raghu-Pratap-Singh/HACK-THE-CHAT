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
    let welcomeref = useRef();
    

    useEffect(()=>{
    
    if (welcomeref.current) {
      gsap.to("#welcome h2", {
        opacity:1,
        delay:0.4,
        duration:1,
        stagger:0.15
      })
      gsap.to("#welcome h2", {
        delay:1.8,
        opacity:0,
        duration:1,
        stagger:0.15
      })
      gsap.to("#welcome", {
        delay:3.3,
        zIndex:-1
      })
    }
    
    
  },[])
    return (
        <>
        <Back/>
        <div id="welcome" ref={welcomeref}>
          <h2>T</h2>
          <h2>R</h2>
          <h2>E</h2>
          <h2>E</h2>
          
        </div>
        </>
    )
}

export default Tree;