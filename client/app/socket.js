"use client";

import { io } from "socket.io-client";

const URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000";

export const socket = io(URL, {
  
  withCredentials: true,     // allow cookies if needed
  autoConnect: false
});