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
        <header className="relative z-10 border-b border-[#152033]/10 bg-white/90 backdrop-blur-xl">
          <div className="flex items-center gap-3 px-4 py-3">
            <Link href="/" className="icon-button" aria-label="Back home">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ff6b4a] text-white shadow-[0_12px_26px_rgba(255,107,74,0.24)]">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-black">Video Match</h1>
              <p className="text-xs font-semibold text-[#687386]">Immersive stranger room</p>
            </div>
            <div className="ml-auto flex items-center gap-2 rounded-full border border-[#152033]/10 bg-white px-3 py-2 text-xs font-black shadow-sm">
              <Wifi className={`h-4 w-4 ${socketConnected ? "text-[#7ee787]" : "text-[#ff6b6b]"}`} />
              {status === "connected" ? "Connected" : socketConnected ? "Online" : "Offline"}
            </div>
          </div>
        </header>
      )}

      <main className="relative z-10 flex min-h-0 flex-1 overflow-hidden">
        {status === "idle" && (
          <section className="relative flex flex-1 items-center justify-center overflow-hidden p-4">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="relative grid w-full max-w-6xl gap-5 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="room-card p-6">
                <div className="mb-5 flex w-fit items-center gap-2 rounded-full border border-[#ff765c]/20 bg-[#fff4ef] px-3 py-2 text-xs font-black uppercase tracking-widest text-[#d85d43]">
                  <Camera className="h-4 w-4" />
                  Video lobby
                </div>
                <h2 className="max-w-xl text-5xl font-black leading-[0.95] tracking-normal sm:text-7xl">A room that feels alive before hello.</h2>
                <p className="mt-5 max-w-lg text-base leading-7 text-[#5f6c7d]">
                  Set a nickname, add interests, check your preview, then jump into a focused face-to-face match.
                </p>
                <button onClick={startChat} disabled={!canStart} className="coral-button mt-7 bg-[#ff6b4a] hover:bg-[#ff7d61]">
                  <Video className="h-5 w-5" />
                  Start Video Match
                </button>
              </div>

              <div className="rounded-[2rem] border border-[#152033]/10 bg-white p-4 text-[#111820] shadow-[0_24px_70px_rgba(21,32,51,0.12)]">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-black uppercase tracking-widest text-[#66727b]">Nickname</span>
                    <input value={nickname} onChange={(event) => setNickname(event.target.value.slice(0, 24))} placeholder="Shown above your camera" className="mt-2 h-12 w-full rounded-xl border border-[#111820]/10 bg-white px-4 font-black outline-none focus:border-[#ff6b4a]" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-black uppercase tracking-widest text-[#66727b]">Custom interest</span>
                    <div className="mt-2 flex gap-2">
                      <input value={interestInput} onChange={(event) => setInterestInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addInterest(interestInput)} placeholder="camera gear, anime" className="h-12 min-w-0 flex-1 rounded-xl border border-[#111820]/10 bg-white px-4 font-bold outline-none focus:border-[#ff6b4a]" />
                      <button onClick={() => addInterest(interestInput)} className="icon-button h-12 w-12" aria-label="Add interest">
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  </label>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[...QUICK_INTERESTS, ...interests].filter((item, index, arr) => arr.indexOf(item) === index).map((interest) => (
                    <button key={interest} onClick={() => setInterests((prev) => (prev.includes(interest) ? prev.filter((item) => item !== interest) : [...prev, interest].slice(0, 8)))} className={`interest-pill ${interests.includes(interest) ? "interest-pill-active bg-[#111820]" : ""}`}>
                      {interest}
                    </button>
                  ))}
                </div>
                <div className="mt-5 aspect-video overflow-hidden rounded-[1.35rem] bg-[#10151d] shadow-inner">
                  <div className="grid h-full grid-cols-[1fr_150px] gap-2 p-2">
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
          <section className="relative flex flex-1 bg-[#06080b]">
            <div className="relative flex-1 overflow-hidden">
              <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" />
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(180deg,rgba(0,0,0,.55)_0%,transparent_25%,transparent_62%,rgba(0,0,0,.62)_100%)]" />
              <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/45 px-4 py-2 text-sm font-black text-white backdrop-blur">
                {strangerName}
              </div>

              <div className="absolute right-4 top-4 h-[24vh] min-h-[150px] w-[min(320px,38vw)] overflow-hidden rounded-2xl border border-white/20 bg-[#111820] shadow-2xl">
                <video ref={attachLocalVideo} autoPlay muted playsInline className={`h-full w-full object-cover ${camOn ? "" : "hidden"}`} />
                {!camOn && (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-white">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ff6b4a] text-2xl font-black">{displayName.charAt(0).toUpperCase()}</div>
                    <span className="text-xs font-black text-white/60">Camera off</span>
                  </div>
                )}
                <div className="absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1 text-xs font-black text-white backdrop-blur">{displayName}</div>
              </div>

              {status === "disconnected" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
                  <p className="text-3xl font-black">Stranger disconnected</p>
                  <button onClick={startChat} className="coral-button mt-4 bg-[#ff6b4a]">
                    Find New Stranger
                  </button>
                </div>
              )}
            </div>

            <AnimatePresence>
              {showChat && (
                <motion.aside initial={{ x: 380, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 380, opacity: 0 }} className="absolute bottom-24 right-4 top-4 z-20 flex w-[min(360px,calc(100vw-2rem))] flex-col rounded-2xl border border-white/12 bg-[#f7f1e7] text-[#111820] shadow-2xl">
                  <div className="flex items-center justify-between border-b border-[#111820]/10 px-4 py-3">
                    <span className="font-black">Chat with {strangerName}</span>
                    <button onClick={() => setShowChat(false)} aria-label="Close chat">
                      <X className="h-5 w-5" />
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
                  <div className="flex gap-2 border-t border-[#111820]/10 p-3">
                    <input value={chatInput} onChange={(event) => setChatInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && sendChat()} placeholder="Type" className="min-w-0 flex-1 rounded-xl border border-[#111820]/10 bg-white px-3 text-sm font-semibold outline-none focus:border-[#ff6b4a]" />
                    <button onClick={sendChat} className="coral-button px-3 py-2 bg-[#ff6b4a]" aria-label="Send chat">
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>

            <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-white/12 bg-black/50 p-2 shadow-2xl backdrop-blur-xl">
              <button onClick={toggleMic} className={`icon-button ${micOn ? "border-white/10 bg-white text-[#111820]" : "border-[#e23d3d] bg-[#e23d3d] text-white"}`} aria-label="Toggle microphone">
                {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </button>
              <button onClick={toggleCamera} className={`icon-button ${camOn ? "border-white/10 bg-white text-[#111820]" : "border-[#e23d3d] bg-[#e23d3d] text-white"}`} aria-label="Toggle camera">
                {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </button>
              <button onClick={skipStranger} disabled={status !== "connected"} className="icon-button border-white/10 bg-white/10 text-white" aria-label="Skip stranger">
                <Shuffle className="h-5 w-5" />
              </button>
              <button onClick={() => setShowChat((value) => !value)} disabled={status !== "connected"} className={`icon-button border-white/10 ${showChat ? "bg-white text-[#111820]" : "bg-white/10 text-white"}`} aria-label="Toggle chat">
                <MessageCircle className="h-5 w-5" />
              </button>
              <button onClick={endChat} className="danger-button h-11 px-4" aria-label="End call">
                <Square className="h-5 w-5" />
              </button>
              <button onClick={() => setFullscreen((value) => !value)} className="icon-button border-white/10 bg-white/10 text-white" aria-label="Toggle fullscreen">
                {fullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </button>
              </div>
          </section>
        )}
      </main>
    </div>
  );
}
