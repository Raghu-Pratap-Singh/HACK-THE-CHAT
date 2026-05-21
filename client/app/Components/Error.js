'use client'
import gsap, { distribute } from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";
import React, { useEffect, useRef, useState, useContext, useDebugValue } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { socket } from "@/app/socket"
import { Context } from '@/app/ContextAPI/Tools';

function Error () {
    let { error_text, setErrorText, is_error, setIsError } = useContext(Context);
    return <>
        <div id="error_cover">
            <div id="error_message">
                <h1>ERROR !!</h1>
                <p>{error_text}</p>
                <button id="error_move_on" onClick={()=>{
                    setIsError(false);
                    setErrorText("");
                }}>continue</button>
            </div>
        </div>
    </>
}

export default Error;