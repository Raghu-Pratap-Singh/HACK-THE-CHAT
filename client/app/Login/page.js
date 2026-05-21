'use client'
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";
import React, { useEffect, useRef } from "react"
import Link from "next/link"
import Back from "../Components/Back";
gsap.registerPlugin(useGSAP, ScrollTrigger);
import { useRouter } from "next/navigation";

function Login() {
  const router = useRouter();
  let user_route = process.env.NEXT_PUBLIC_USERROUTE;
  const route = process.env.NEXT_PUBLIC_HOMEROUTE;
  let welcomeref = useRef();
  let loginref = useRef();

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
    if (loginref.current) {
      gsap.to(loginref.current, {
        opacity: 1,
        delay: 3.7,
        duration: 0.7
      })
    }

  }, [])

  const handleLogin = async (e) => {
    e.preventDefault();

    const form = e.target;
    const email = form.new_email.value;
    const password = form.new_password.value;

    const res = await fetch(`${user_route}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    console.log(data, "hi")
    if (res.ok) {
      console.log(data.userid)
      router.push(`/Profile/${data.userid}`);
    } else {
      alert("Login failed");
    }
  };

  return (
    <>
      <Back />
      <div id="welcome" ref={welcomeref}>
        <h2>L</h2>
        <h2>O</h2>
        <h2>G</h2>
        <h2>I</h2>
        <h2>N</h2>

      </div>

      <div id="login_container">
        <div id="login_box" ref={loginref}>
          <h1>LOGIN</h1>
          <form id="login_form" onSubmit={handleLogin} autoComplete="off">

            <input type="text" name="fakeuser" style={{ display: "none" }} />
            <input type="password" name="fakepass" style={{ display: "none" }} />

            <div id="inputs">
              <input type="email" placeholder="email..." name="new_email" autoComplete="off" />
              <input type="password" placeholder="Password..." name="new_password" autoComplete="new-password" />
            </div>

            <div id="login_button">
              <input type="submit" value={"login"} />
              <Link href={"/Create"}>Don't have an account?</Link>
            </div>

          </form>
        </div>

      </div>

    </>
  )
}
export default Login;