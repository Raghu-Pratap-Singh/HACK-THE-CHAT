'use client'
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";
import React, { useEffect, useRef, useState , useContext} from "react"
import Link from "next/link"
import { useRouter } from "next/navigation";
import Back from "../Components/Back";
import Error from "@/app/Components/Error";
import { Context } from '@/app/ContextAPI/Tools';
gsap.registerPlugin(useGSAP, ScrollTrigger);
function Create() {
  let { error_text, setErrorText, is_error, setIsError } = useContext(Context);
  let welcomeref = useRef();
  let loginref = useRef();
  const router = useRouter();
  let [isotp, setIsotp] = useState(0);
  let [otp, setOtp] = useState("")
  let [username, setUsername] = useState("");
  let [email, setEmail] = useState("");
  let [password, setPassword] = useState("");

  const route = process.env.NEXT_PUBLIC_HOMEROUTE;
  let user_route = process.env.NEXT_PUBLIC_USERROUTE
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
  async function generate_OTP(e) {
    try {
      e.preventDefault();

      const form = e.target;
      const email_1 = form.new_email.value;
      setEmail(email_1);
      if (!username || !email_1 || !password) {
        setErrorText("All fields are required");
        setIsError(true);
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email_1)) {
        setErrorText("Please enter a valid email address");
        setIsError(true);
        return;
      }

      let otp_req = await fetch(`${user_route}/genotp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email : email_1 })
      })

      let data = await otp_req.json();
      if (data.ok) {
        // now wake input of otp from user and send request on backend to match
        alert("OTP sent to your email");
        setIsotp(1)
        return;

      } else {
        setErrorText(`${data.error}`);
        setIsError(true);

        setEmail("");
        setPassword("");
        setUsername("");
        setIsotp(0)
      }
    } catch (err) {
      setErrorText("Server error");
      setIsError(true);
      setEmail("");
      setPassword("");
      setUsername("");
      setIsotp(0);
    }
  }
  async function check(e) {
    try {
      if (!otp) {
        setErrorText("Enter OTP");
        setIsError(true);
        return;
      }
      let match_req = await fetch(`${user_route}/matchotp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ otp , email})
      })

      let data = await match_req.json();
      if (data.ok) {
        // otp matched, now register this user
        const res = await fetch(`${user_route}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ username, email, password })
        });
        const res_data = await res.json();
        if (res.ok) {
          
          router.push(`/Profile/${res_data.userid}`);
          setEmail("");
          setPassword("");
          setUsername("");
          setIsotp(0)
          setOtp("");
        } else {
          setErrorText(`${res_data.error}`);
          setIsError(true);
          
          setIsotp(0)
          setOtp("");
        }
      } else {
        setErrorText(`${data.error}`);
        setIsError(true);
        
        setIsotp(0)
        setOtp("");
      }
    } catch (err) {
      setErrorText("Some error occured");
      setIsError(true);

      setEmail("");
      setPassword("");
      setUsername("");
      setIsotp(0)
      setOtp("");
    }
  }
 

  return (
    <>
      {is_error && <Error/>}
      <Back />
      <div id="welcome" ref={welcomeref}>
        <h2>C</h2>
        <h2>R</h2>
        <h2>E</h2>
        <h2>A</h2>
        <h2>T</h2>
        <h2>E</h2>
      </div>
      {isotp && <div id="otpbox">
        <div id="otp_taker">
          <h1>Please enter OTP sent to your email</h1>
          <input type="password" name="otp" placeholder="OTP" onChange={(e) => {
            setOtp(e.target.value);
          }}></input>
          <button onClick={(e) => {
            e.preventDefault();
            check()
          }}>Submit</button>
        </div>
      </div> || null}
      <div id="login_container">

        <div id="login_box" ref={loginref}>
          <h1>CREATE ACCOUNT</h1>

          {/* ONLY CHANGE IS HERE */}
          <form id="login_form" onSubmit={(e) => {
            generate_OTP(e)
          }} autoComplete="off">

            <input type="text" name="fakeuser" style={{ display: "none" }} />
            <input type="password" name="fakepass" style={{ display: "none" }} />

            <div id="inputs" >
              <input disabled={isotp} type="text" placeholder="Username..." name="new_username" autoComplete="off" onChange={(e) => { setUsername(e.target.value) }} />
              <input disabled={isotp} type="email" placeholder="email..." name="new_email" autoComplete="off" onChange={(e) => { setEmail(e.target.value) }} />
              <input disabled={isotp} type="password" placeholder="Password..." name="new_password" autoComplete="new-password" onChange={(e) => { setPassword(e.target.value) }} />
            </div>

            <div id="login_button">
              <input type="submit" value={"Create account"} disabled={isotp}/>
              <Link href={"/Login"}>Already have an account?</Link>
            </div>
          </form>

        </div>
      </div>
    </>
  )
}
export default Create;