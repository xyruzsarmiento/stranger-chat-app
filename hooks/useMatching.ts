"use client";

import { useState, useCallback } from "react";
import { useSocket } from "./useSocket";

type ChatType = "text" | "video" | "voice";
type Status = "idle" | "searching" | "connected" | "disconnected";

export function useMatching(type: ChatType) {
  const { socket, connected } = useSocket();
  const [status, setStatus] = useState<Status>("idle");
  const [interests, setInterests] = useState<string[]>([]);
  const [nickname, setNickname] = useState("");

  const joinQueue = useCallback(() => {
    if (!socket || !connected) return;
    setStatus("searching");
    socket.emit("join-queue", { type, interests, nickname });

    socket.once("matched", () => setStatus("connected"));
    socket.once("stranger-left", () => setStatus("disconnected"));
  }, [socket, connected, type, interests, nickname]);

  const skip = useCallback(() => {
    socket?.emit("skip");
    joinQueue();
  }, [socket, joinQueue]);

  const leave = useCallback(() => {
    socket?.emit("leave");
    setStatus("idle");
  }, [socket]);

  return { status, setStatus, interests, setInterests, nickname, setNickname, joinQueue, skip, leave };
}
