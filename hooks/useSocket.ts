"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || undefined;

let globalSocket: Socket | null = null;

export function useSocket() {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!globalSocket) {
      globalSocket = io(SOCKET_URL, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    }

    socketRef.current = globalSocket;

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    globalSocket.on("connect", handleConnect);
    globalSocket.on("disconnect", handleDisconnect);

    if (globalSocket.connected) setConnected(true);

    return () => {
      globalSocket?.off("connect", handleConnect);
      globalSocket?.off("disconnect", handleDisconnect);
    };
  }, []);

  return { socket: socketRef.current, connected };
}
