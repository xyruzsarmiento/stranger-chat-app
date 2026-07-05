"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Mic, MicOff, PhoneOff, Plus, Radio, Shuffle, Sparkles, Volume2, Wifi, WifiOff, X } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";
import { useWebRTC } from "@/hooks/useWebRTC";

type AudioWindow = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext };
type PeerInfo = { nickname?: string; interests?: string[] };

const QUICK_INTERESTS = ["Music", "Gaming", "Movies", "Study", "Design", "Travel"];

export default function VoiceChatPage() {
  const [status, setStatus] = useState<"idle" | "searching" | "connected" | "disconnected">("idle");
  const [nickname, setNickname] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [interests, setInterests] = useState<string[]>(["Music"]);
  const [strangerInfo, setStrangerInfo] = useState<PeerInfo>({});
  const [micOn, setMicOn] = useState(true);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const { socket, connected: socketConnected } = useSocket();
  const { localStream, startLocalStream, stopLocalStream, setLocalAudioEnabled, createPeer, signalPeer } = useWebRTC();

  const displayName = nickname.trim() || "You";
  const strangerName = strangerInfo.nickname || "Stranger";
  const canStart = socketConnected && nickname.trim().length > 0;

  useEffect(() => {
    if (status !== "connected") {
      clearInterval(timerRef.current);
      setDuration(0);
      return;
    }
    timerRef.current = setInterval(() => setDuration((value) => value + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [status]);

  useEffect(() => {
    if (!localStream || !micOn) {
      setVolume(0);
      return;
    }

    const AudioContextClass = window.AudioContext || (window as AudioWindow).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const analyser = context.createAnalyser();
    const source = context.createMediaStreamSource(localStream);
    let frame = 0;

    source.connect(analyser);
    analyser.fftSize = 256;
    const data = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteFrequencyData(data);
      const average = data.reduce((sum, item) => sum + item, 0) / data.length;
      setVolume(average);
      frame = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(frame);
      context.close();
    };
  }, [localStream, micOn]);

  useEffect(() => {
    if (!socket) return;

    socket.on("matched", (data: { initiator: boolean; strangerInfo?: PeerInfo }) => {
      setStatus("connected");
      setStrangerInfo(data.strangerInfo ?? {});
      if (!localStream) return;
      setLocalAudioEnabled(micOn);
      const peer = createPeer(data.initiator, localStream);
      if (!peer) return;

      peer.on("signal", (signal: unknown) => socket.emit("signal", { signal }));
      peer.on("stream", (stream: MediaStream) => {
        if (!remoteAudioRef.current || stream.id === localStream.id) return;
        remoteAudioRef.current.srcObject = stream;
        remoteAudioRef.current.muted = false;
        remoteAudioRef.current.play().catch(() => {});
      });
    });

    socket.on("signal", (data: { signal: unknown }) => signalPeer(data.signal));
    socket.on("stranger-left", () => {
      setStatus("disconnected");
      if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    });

    return () => {
      socket.off("matched");
      socket.off("signal");
      socket.off("stranger-left");
    };
  }, [socket, localStream, createPeer, signalPeer, micOn, setLocalAudioEnabled]);

  const addInterest = (value: string) => {
    const clean = value.trim().slice(0, 24);
    if (!clean) return;
    setInterests((prev) => (prev.includes(clean) ? prev : [...prev, clean].slice(0, 8)));
    setInterestInput("");
  };

  const joinQueue = useCallback(() => {
    socket?.emit("join-queue", { type: "voice", nickname: nickname.trim(), interests });
  }, [socket, nickname, interests]);

  const startChat = useCallback(async () => {
    if (!socket || !canStart) return;
    setStatus("searching");
    setStrangerInfo({});
    const stream = await startLocalStream({ audio: true, video: false });
    if (!stream) {
      setStatus("idle");
      return;
    }
    stream.getAudioTracks().forEach((track) => {
      track.enabled = micOn;
    });
    joinQueue();
  }, [socket, canStart, startLocalStream, micOn, joinQueue]);

  const endChat = () => {
    socket?.emit("leave");
    stopLocalStream();
    setStatus("idle");
    setStrangerInfo({});
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
  };

  const skipStranger = () => {
    if (!socket) return;
    socket.emit("skip");
    setStatus("searching");
    setStrangerInfo({});
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    joinQueue();
  };

  const toggleMic = () => {
    const next = !micOn;
    setLocalAudioEnabled(next);
    setMicOn(next);
  };

  const formatTime = (seconds: number) =>
    `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  const meter = Math.min(100, Math.round(volume * 1.2));

  return (
    <div className="room-bg flex min-h-screen flex-col">
      <audio ref={remoteAudioRef} autoPlay playsInline />
      <div className="room-grid" />

      <header className="relative z-10 border-b border-[#152033]/10 bg-white/90 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/" className="icon-button" aria-label="Back home">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#21c7b7] text-[#061012] shadow-[0_12px_26px_rgba(33,199,183,0.24)]">
            <Mic className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-black">Voice Match</h1>
            <p className="text-xs font-semibold text-[#687386]">Signal-rich audio room</p>
          </div>
          <div className="ml-auto flex items-center gap-2 rounded-full border border-[#152033]/10 bg-white px-3 py-2 text-xs font-black shadow-sm">
            {socketConnected ? <Wifi className="h-4 w-4 text-[#7ee787]" /> : <WifiOff className="h-4 w-4 text-[#ff6b6b]" />}
            {status === "connected" ? formatTime(duration) : socketConnected ? "Online" : "Offline"}
          </div>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center overflow-hidden p-4">

        {status === "idle" && (
          <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="relative grid w-full max-w-6xl gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="room-card p-6">
              <div className="mb-6 flex w-fit items-center gap-2 rounded-full border border-[#17c3b2]/20 bg-[#ecfffc] px-3 py-2 text-xs font-black uppercase tracking-widest text-[#0e9f91]">
                <Radio className="h-4 w-4" />
                Voice studio
              </div>
              <h2 className="max-w-xl text-5xl font-black leading-[0.95] tracking-normal sm:text-7xl">Speak first. Stay mysterious.</h2>
              <p className="mt-5 max-w-lg text-base leading-7 text-[#5f6c7d]">
                A calmer room for spontaneous calls, tuned around your voice, nickname, and conversation interests.
              </p>
              <button onClick={startChat} disabled={!canStart} className="teal-button mt-7 bg-[#17c3b2] text-[#061012] hover:bg-[#3dd9cb]">
                <Mic className="h-5 w-5" />
                Enter Voice Match
              </button>
            </div>

            <div className="rounded-[2rem] border border-[#152033]/10 bg-white p-4 text-[#121820] shadow-[0_24px_70px_rgba(21,32,51,0.12)]">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-widest text-[#65717a]">Nickname</span>
                  <input value={nickname} onChange={(event) => setNickname(event.target.value.slice(0, 24))} placeholder="What should they call you?" className="mt-2 h-12 w-full rounded-xl border border-[#121820]/10 bg-white px-4 font-black outline-none focus:border-[#17c3b2]" />
                </label>
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-widest text-[#65717a]">Custom interest</span>
                  <div className="mt-2 flex gap-2">
                    <input value={interestInput} onChange={(event) => setInterestInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addInterest(interestInput)} placeholder="lofi, gym, films" className="h-12 min-w-0 flex-1 rounded-xl border border-[#121820]/10 bg-white px-4 font-bold outline-none focus:border-[#17c3b2]" />
                    <button onClick={() => addInterest(interestInput)} className="icon-button h-12 w-12" aria-label="Add interest">
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </label>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {[...QUICK_INTERESTS, ...interests].filter((item, index, arr) => arr.indexOf(item) === index).map((interest) => (
                  <button key={interest} onClick={() => setInterests((prev) => (prev.includes(interest) ? prev.filter((item) => item !== interest) : [...prev, interest].slice(0, 8)))} className={`interest-pill ${interests.includes(interest) ? "interest-pill-active bg-[#121820]" : ""}`}>
                    {interest}
                  </button>
                ))}
              </div>
              <div className="mt-5 overflow-hidden rounded-[1.35rem] bg-[#10151d] p-5 text-white">
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-white/45">
                  <span>{displayName}</span>
                  <span>{interests.length || 0} interests</span>
                </div>
                <div className="mt-12 flex items-end justify-center gap-2">
                  {[34, 62, 88, 50, 76, 42, 66].map((height, index) => (
                    <span key={index} className="w-5 rounded-full bg-[#17c3b2]" style={{ height }} />
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {status === "searching" && (
          <section className="relative flex flex-col items-center gap-5 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-[1.5rem] border border-white/10 bg-white/10 shadow-2xl backdrop-blur">
              <Loader2 className="h-10 w-10 animate-spin text-[#17c3b2]" />
            </div>
            <div>
              <p className="text-3xl font-black">Tuning the room</p>
              <p className="mt-1 text-sm font-semibold text-white/55">Finding someone who wants to talk.</p>
            </div>
            <button onClick={endChat} className="danger-button">
              <X className="h-5 w-5" />
              Cancel
            </button>
          </section>
        )}

        {(status === "connected" || status === "disconnected") && (
          <motion.section initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="room-card relative w-full max-w-4xl p-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
              <div className="rounded-[1.5rem] bg-[#f6f2e9] p-6 text-center text-[#101820]">
                <div className="mx-auto flex h-72 w-72 items-center justify-center">
                  <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-[#101820] text-white shadow-[0_0_0_16px_rgba(23,195,178,0.12)]">
                    {status === "connected" && (
                      <>
                        <span className="absolute rounded-full border border-[#17c3b2]/45" style={{ width: 190 + meter, height: 190 + meter }} />
                        <span className="absolute rounded-full border border-[#ffcf56]/45" style={{ width: 230 + meter * 0.7, height: 230 + meter * 0.7 }} />
                      </>
                    )}
                    <Volume2 className="h-16 w-16 text-[#ffcf56]" />
                  </div>
                </div>
                <p className="text-4xl font-black">{status === "connected" ? strangerName : "Stranger disconnected"}</p>
                <p className="mt-1 font-mono text-sm font-black text-[#65717a]">{status === "connected" ? formatTime(duration) : "Call ended"}</p>
                <div className="mx-auto mt-6 grid h-12 max-w-md grid-cols-12 items-end gap-1 rounded-full bg-white p-2 shadow-inner">
                  {Array.from({ length: 12 }).map((_, index) => (
                    <span key={index} className="rounded-full bg-[#17c3b2] transition-all" style={{ height: `${Math.max(18, Math.min(100, meter + ((index % 4) - 1) * 14))}%`, opacity: micOn ? 1 : 0.25 }} />
                  ))}
                </div>
              </div>

              <aside className="rounded-[1.5rem] border border-white/10 bg-[#101820] p-5">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#17c3b2]">
                  <Sparkles className="h-4 w-4" />
                  Match card
                </div>
                <div className="mt-5 rounded-2xl bg-white/10 p-4">
                  <div className="text-xs font-bold text-white/45">You</div>
                  <div className="mt-1 text-xl font-black">{displayName}</div>
                </div>
                <div className="mt-3 rounded-2xl bg-white/10 p-4">
                  <div className="text-xs font-bold text-white/45">Stranger</div>
                  <div className="mt-1 text-xl font-black">{strangerName}</div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(strangerInfo.interests?.length ? strangerInfo.interests : ["Open chat"]).map((interest) => (
                    <span key={interest} className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-white/80">{interest}</span>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <button onClick={toggleMic} className={`icon-button h-14 w-14 border-white/10 ${micOn ? "bg-white text-[#101820]" : "bg-[#e23d3d] text-white"}`} aria-label="Toggle microphone">
                    {micOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                  </button>
                  <button onClick={endChat} className="danger-button h-14 px-5" aria-label="End call">
                    <PhoneOff className="h-6 w-6" />
                  </button>
                  <button onClick={skipStranger} disabled={status !== "connected"} className="icon-button h-14 w-14 border-white/10 bg-white/5 text-white" aria-label="Skip stranger">
                    <Shuffle className="h-6 w-6" />
                  </button>
                </div>
                {status === "disconnected" && (
                  <button onClick={startChat} className="teal-button mt-5 w-full bg-[#17c3b2] text-[#061012]">Find New Voice</button>
                )}
              </aside>
            </div>
          </motion.section>
        )}
      </main>
    </div>
  );
}
