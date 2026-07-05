"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Camera,
  Loader2,
  Maximize2,
  MessageCircle,
  Mic,
  MicOff,
  Minimize2,
  Plus,
  Send,
  Shuffle,
  Square,
  User,
  Video,
  VideoOff,
  Wifi,
  X,
} from "lucide-react";
import { useSocket } from "@/hooks/useSocket";
import { useWebRTC } from "@/hooks/useWebRTC";

interface Message {
  id: string;
  text: string;
  sender: "me" | "stranger";
}

type PeerInfo = { nickname?: string; interests?: string[] };

const QUICK_INTERESTS = ["Music", "Gaming", "Movies", "Tech", "Travel", "Fitness"];

export default function VideoChatPage() {
  const [status, setStatus] = useState<"idle" | "searching" | "connected" | "disconnected">("idle");
  const [nickname, setNickname] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [interests, setInterests] = useState<string[]>(["Movies"]);
  const [strangerInfo, setStrangerInfo] = useState<PeerInfo>({});
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { socket, connected: socketConnected } = useSocket();
  const { localStream, startLocalStream, stopLocalStream, setLocalAudioEnabled, setLocalVideoEnabled, createPeer, signalPeer } = useWebRTC();

  const displayName = nickname.trim() || "You";
  const strangerName = strangerInfo.nickname || "Stranger";
  const canStart = socketConnected && nickname.trim().length > 0;

  const attachLocalVideo = useCallback(
    (node: HTMLVideoElement | null) => {
      localVideoRef.current = node;
      if (node && localStream) {
        node.srcObject = localStream;
        node.muted = true;
        node.play().catch(() => {});
      }
    },
    [localStream]
  );

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(() => {});
    }
  }, [localStream, status, camOn]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    socket.on("matched", (data: { initiator: boolean; strangerInfo?: PeerInfo }) => {
      setStatus("connected");
      setStrangerInfo(data.strangerInfo ?? {});
      if (!localStream) return;
      setLocalAudioEnabled(micOn);
      setLocalVideoEnabled(camOn);
      const peer = createPeer(data.initiator, localStream);
      if (!peer) return;

      peer.on("signal", (signal: unknown) => socket.emit("signal", { signal }));
      peer.on("stream", (stream: MediaStream) => {
        if (!remoteVideoRef.current || stream.id === localStream.id) return;
        remoteVideoRef.current.srcObject = stream;
        remoteVideoRef.current.play().catch(() => {});
      });
      peer.on("close", () => {
        setStatus("disconnected");
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      });
    });

    socket.on("signal", (data: { signal: unknown }) => signalPeer(data.signal));
    socket.on("message", (data: { text: string }) => {
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), text: data.text, sender: "stranger" }]);
    });
    socket.on("stranger-left", () => {
      setStatus("disconnected");
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    });

    return () => {
      socket.off("matched");
      socket.off("signal");
      socket.off("message");
      socket.off("stranger-left");
    };
  }, [socket, localStream, createPeer, signalPeer, micOn, camOn, setLocalAudioEnabled, setLocalVideoEnabled]);

  const addInterest = (value: string) => {
    const clean = value.trim().slice(0, 24);
    if (!clean) return;
    setInterests((prev) => (prev.includes(clean) ? prev : [...prev, clean].slice(0, 8)));
    setInterestInput("");
  };

  const joinQueue = useCallback(() => {
    socket?.emit("join-queue", { type: "video", nickname: nickname.trim(), interests });
  }, [socket, nickname, interests]);

  const startChat = useCallback(async () => {
    if (!socket || !canStart) return;
    setStatus("searching");
    setMessages([]);
    setShowChat(false);
    setStrangerInfo({});
    const stream = await startLocalStream({ video: true, audio: true });
    if (!stream) {
      setStatus("idle");
      return;
    }
    stream.getAudioTracks().forEach((track) => {
      track.enabled = micOn;
    });
    stream.getVideoTracks().forEach((track) => {
      track.enabled = camOn;
    });
    joinQueue();
  }, [socket, canStart, startLocalStream, micOn, camOn, joinQueue]);

  const skipStranger = () => {
    if (!socket) return;
    socket.emit("skip");
    setStatus("searching");
    setMessages([]);
    setStrangerInfo({});
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    joinQueue();
  };

  const endChat = () => {
    socket?.emit("leave");
    stopLocalStream();
    setStatus("idle");
    setMessages([]);
    setShowChat(false);
    setStrangerInfo({});
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  };

  const toggleCamera = () => {
    const next = !camOn;
    setLocalVideoEnabled(next);
    setCamOn(next);
  };

  const toggleMic = () => {
    const next = !micOn;
    setLocalAudioEnabled(next);
    setMicOn(next);
  };

  const sendChat = () => {
    if (!chatInput.trim() || status !== "connected" || !socket) return;
    const text = chatInput.trim();
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), text, sender: "me" }]);
    socket.emit("message", { text });
    setChatInput("");
  };

  return (
    <div className={`room-bg flex min-h-screen flex-col ${fullscreen ? "fixed inset-0 z-50" : ""}`}>
      <div className="room-grid" />
      {!fullscreen && (
        <header className="relative z-10 border-b border-[#152033]/10 bg-white/95 backdrop-blur-xl">
          <div className="flex items-center gap-2 px-3 py-2 sm:px-4">
            <Link href="/" className="icon-button h-9 w-9 rounded-lg" aria-label="Back home">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ff6b4a] text-white shadow-[0_10px_22px_rgba(255,107,74,0.20)]">
              <Video className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-base font-black leading-tight">Video Match</h1>
              <p className="text-[11px] font-semibold text-[#687386]">Live stranger room</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 rounded-full border border-[#152033]/10 bg-white px-2.5 py-1.5 text-[11px] font-black shadow-sm">
              <Wifi className={`h-3.5 w-3.5 ${socketConnected ? "text-[#15b86a]" : "text-[#ff6b6b]"}`} />
              {status === "connected" ? "Connected" : socketConnected ? "Online" : "Offline"}
            </div>
          </div>
        </header>
      )}

      <main className="relative z-10 flex min-h-0 flex-1 overflow-hidden">
        {status === "idle" && (
          <section className="relative flex flex-1 items-center justify-center overflow-hidden p-4">
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="relative grid w-full max-w-5xl gap-4 lg:grid-cols-[0.85fr_1fr]">
              <div className="room-card p-4 sm:p-5">
                <div className="mb-4 flex w-fit items-center gap-2 rounded-full border border-[#ff765c]/20 bg-[#fff4ef] px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-[#d85d43]">
                  <Camera className="h-4 w-4" />
                  Video lobby
                </div>
                <h2 className="max-w-xl text-3xl font-black leading-tight tracking-normal sm:text-4xl">Start a clean face-to-face match.</h2>
                <p className="mt-3 max-w-lg text-sm leading-6 text-[#5f6c7d]">
                  Set a nickname, add interests, check your preview, then jump into a focused face-to-face match.
                </p>
                <button onClick={startChat} disabled={!canStart} className="coral-button mt-5 px-4 py-2.5 bg-[#ff6b4a] hover:bg-[#ff7d61]">
                  <Video className="h-4 w-4" />
                  Start Video Match
                </button>
              </div>

              <div className="rounded-2xl border border-[#152033]/10 bg-white p-4 text-[#111820] shadow-[0_18px_50px_rgba(21,32,51,0.10)]">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-black uppercase tracking-widest text-[#66727b]">Nickname</span>
                    <input value={nickname} onChange={(event) => setNickname(event.target.value.slice(0, 24))} placeholder="Shown above your camera" className="mt-2 h-10 w-full rounded-xl border border-[#111820]/10 bg-white px-3 text-sm font-black outline-none focus:border-[#ff6b4a]" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-black uppercase tracking-widest text-[#66727b]">Custom interest</span>
                    <div className="mt-2 flex gap-2">
                      <input value={interestInput} onChange={(event) => setInterestInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addInterest(interestInput)} placeholder="camera gear, anime" className="h-10 min-w-0 flex-1 rounded-xl border border-[#111820]/10 bg-white px-3 text-sm font-bold outline-none focus:border-[#ff6b4a]" />
                      <button onClick={() => addInterest(interestInput)} className="icon-button h-10 w-10" aria-label="Add interest">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </label>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[...QUICK_INTERESTS, ...interests].filter((item, index, arr) => arr.indexOf(item) === index).map((interest) => (
                    <button key={interest} onClick={() => setInterests((prev) => (prev.includes(interest) ? prev.filter((item) => item !== interest) : [...prev, interest].slice(0, 8)))} className={`interest-pill px-2.5 py-1 text-xs ${interests.includes(interest) ? "interest-pill-active bg-[#111820]" : ""}`}>
                      {interest}
                    </button>
                  ))}
                </div>
                <div className="mt-4 aspect-video overflow-hidden rounded-xl bg-[#10151d] shadow-inner">
                  <div className="grid h-full grid-cols-[1fr_120px] gap-2 p-2">
                    <div className="relative flex items-center justify-center overflow-hidden rounded-xl bg-[linear-gradient(135deg,#1c2430,#0b1016)] text-white/45">
                      <User className="h-16 w-16" />
                      <span className="absolute left-3 top-3 rounded-full bg-black/45 px-3 py-1 text-xs font-black text-white">Stranger</span>
                    </div>
                    <div className="relative flex items-center justify-center overflow-hidden rounded-xl bg-[#ff6b4a] text-white">
                      <span className="text-5xl font-black">{displayName.charAt(0).toUpperCase()}</span>
                      <span className="absolute left-2 top-2 rounded-full bg-black/40 px-2 py-1 text-[10px] font-black">{displayName}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>
        )}

        {status === "searching" && (
          <section className="relative flex flex-1 flex-col items-center justify-center gap-5 overflow-hidden text-center">
            <div className="absolute inset-0 bg-[#06080b]" />
            {localStream && (
              <div className="absolute bottom-6 right-6 z-10 h-36 w-56 overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl">
                <video ref={attachLocalVideo} autoPlay muted playsInline className={`h-full w-full object-cover ${camOn ? "" : "hidden"}`} />
                {!camOn && <div className="flex h-full items-center justify-center text-sm font-black text-white/60">Camera off</div>}
              </div>
            )}
            <div className="relative flex h-24 w-24 items-center justify-center rounded-[1.5rem] border border-white/10 bg-white/10">
              <Loader2 className="h-10 w-10 animate-spin text-[#ff6b4a]" />
            </div>
            <div className="relative">
              <p className="text-3xl font-black">Opening a live room</p>
              <p className="mt-1 text-sm font-semibold text-white/55">Your self-preview is live while we match you.</p>
            </div>
            <button onClick={endChat} className="danger-button relative">
              <X className="h-5 w-5" />
              Cancel
            </button>
          </section>
        )}

        {(status === "connected" || status === "disconnected") && (
          <section className="relative flex flex-1 flex-col gap-3 overflow-hidden bg-[#0d1422] p-3 text-white sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 shadow-sm backdrop-blur">
              <div className="min-w-0 text-sm font-black">
                <span className="text-white">{displayName}</span>
                <span className="mx-2 text-white/35">-</span>
                <span className="text-white">{strangerName}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-white/60">
                <span className={`h-2 w-2 rounded-full ${status === "connected" ? "bg-[#15b86a]" : "bg-[#ff6b6b]"}`} />
                {status === "connected" ? "Live match" : "Disconnected"}
              </div>
            </div>

            <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-2">
              <div className="relative min-h-[240px] overflow-hidden rounded-2xl border border-white/10 bg-[#111827] shadow-[0_18px_55px_rgba(0,0,0,0.28)] sm:min-h-[320px] lg:min-h-0">
                <video ref={attachLocalVideo} autoPlay muted playsInline className={`h-full w-full object-cover ${camOn ? "" : "hidden"}`} />
                {!camOn && (
                  <div className="flex h-full flex-col items-center justify-center gap-3 bg-[#151d2d]">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ff6b4a] text-2xl font-black">{displayName.charAt(0).toUpperCase()}</div>
                    <span className="text-xs font-black text-white/55">Camera off</span>
                  </div>
                )}
                <div className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-xs font-black text-white shadow-sm backdrop-blur">
                  USER
                </div>
                <div className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-black/45 px-3 py-1.5 text-xs font-bold text-white/90 backdrop-blur">
                  {displayName}
                </div>
              </div>

              <div className="relative min-h-[240px] overflow-hidden rounded-2xl border border-white/10 bg-[#111827] shadow-[0_18px_55px_rgba(0,0,0,0.28)] sm:min-h-[320px] lg:min-h-0">
                <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.18),transparent_40%,rgba(0,0,0,.42))]" />
                <div className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-xs font-black text-white shadow-sm backdrop-blur">
                  STRANGER
                </div>
                <div className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-black/45 px-3 py-1.5 text-xs font-bold text-white/90 backdrop-blur">
                  {strangerName}
                </div>
                {status === "disconnected" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 px-4 text-center">
                    <p className="text-xl font-black">Stranger disconnected</p>
                    <button onClick={startChat} className="coral-button mt-4 px-4 py-2.5 bg-[#ff6b4a]">
                      Find New Stranger
                    </button>
                  </div>
                )}
              </div>
            </div>

            <AnimatePresence>
              {showChat && (
                <motion.aside initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }} className="absolute bottom-[86px] right-3 z-20 flex h-[min(420px,calc(100%-7rem))] w-[min(340px,calc(100vw-1.5rem))] flex-col rounded-2xl border border-white/10 bg-[#f8fafc] text-[#111820] shadow-2xl sm:right-4">
                  <div className="flex items-center justify-between border-b border-[#111820]/10 px-3 py-2.5">
                    <span className="text-sm font-black">Chat with {strangerName}</span>
                    <button onClick={() => setShowChat(false)} aria-label="Close chat">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex-1 space-y-2 overflow-y-auto p-3">
                    {messages.map((message) => (
                      <div key={message.id} className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}>
                        <div className={message.sender === "me" ? "chat-bubble-sent max-w-[82%] text-sm" : "chat-bubble-received max-w-[82%] text-sm"}>{message.text}</div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="flex gap-2 border-t border-[#111820]/10 p-2.5">
                    <input value={chatInput} onChange={(event) => setChatInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && sendChat()} placeholder="Type" className="h-10 min-w-0 flex-1 rounded-xl border border-[#111820]/10 bg-white px-3 text-sm font-semibold outline-none focus:border-[#ff6b4a]" />
                    <button onClick={sendChat} className="coral-button h-10 px-3 py-2 bg-[#ff6b4a]" aria-label="Send chat">
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>

            <div className="mx-auto flex max-w-full flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.07] p-2 shadow-2xl backdrop-blur-xl">
              <button onClick={toggleMic} className={`icon-button h-10 w-10 ${micOn ? "border-white/10 bg-white text-[#111820]" : "border-[#e23d3d] bg-[#e23d3d] text-white"}`} aria-label="Toggle microphone">
                {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </button>
              <button onClick={toggleCamera} className={`icon-button h-10 w-10 ${camOn ? "border-white/10 bg-white text-[#111820]" : "border-[#e23d3d] bg-[#e23d3d] text-white"}`} aria-label="Toggle camera">
                {camOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </button>
              <button onClick={skipStranger} disabled={status !== "connected"} className="icon-button h-10 w-10 border-white/10 bg-white/10 text-white" aria-label="Skip stranger">
                <Shuffle className="h-4 w-4" />
              </button>
              <button onClick={() => setShowChat((value) => !value)} disabled={status !== "connected"} className={`icon-button h-10 w-10 border-white/10 ${showChat ? "bg-white text-[#111820]" : "bg-white/10 text-white"}`} aria-label="Toggle chat">
                <MessageCircle className="h-4 w-4" />
              </button>
              <button onClick={endChat} className="danger-button h-10 px-3 text-sm" aria-label="End call">
                <Square className="h-4 w-4" />
                End
              </button>
              <button onClick={() => setFullscreen((value) => !value)} className="icon-button h-10 w-10 border-white/10 bg-white/10 text-white" aria-label="Toggle fullscreen">
                {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
