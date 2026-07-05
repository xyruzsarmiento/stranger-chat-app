"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Flag, Loader2, MessageCircle, Plus, Send, Shuffle, Smile, Square, Sparkles, Wifi, WifiOff, X } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";

interface Message {
  id: string;
  text: string;
  sender: "me" | "stranger" | "system";
  timestamp: Date;
}

type PeerInfo = { nickname?: string; country?: string; interests?: string[] };

const QUICK_INTERESTS = ["Gaming", "Music", "Anime", "Tech", "Sports", "Movies", "Travel", "Art", "Science", "Design"];
const QUICK_REPLIES = [":)", ":D", "<3", "Nice", "Wait what", "Same", "Tell me more", "LOL"];

export default function TextChatPage() {
  const [status, setStatus] = useState<"idle" | "searching" | "connected" | "disconnected">("idle");
  const [nickname, setNickname] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [strangerTyping, setStrangerTyping] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["Music"]);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [strangerInfo, setStrangerInfo] = useState<PeerInfo>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout>>();
  const { socket, connected: socketConnected } = useSocket();

  const displayName = nickname.trim() || "You";
  const strangerName = strangerInfo.nickname || "Stranger";
  const canStart = socketConnected && nickname.trim().length > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, strangerTyping]);

  useEffect(() => {
    if (!socket) return;

    socket.on("matched", (data: { strangerInfo?: PeerInfo }) => {
      setStatus("connected");
      setStrangerInfo(data.strangerInfo ?? {});
      setStrangerTyping(false);
      setMessages([
        {
          id: crypto.randomUUID(),
          text: `Connected with ${data.strangerInfo?.nickname || "Stranger"}. Keep it human and respectful.`,
          sender: "system",
          timestamp: new Date(),
        },
      ]);
    });

    socket.on("message", (data: { text: string }) => {
      setStrangerTyping(false);
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), text: data.text, sender: "stranger", timestamp: new Date() }]);
    });

    socket.on("typing", () => setStrangerTyping(true));
    socket.on("stop-typing", () => setStrangerTyping(false));
    socket.on("stranger-left", () => {
      setStatus("disconnected");
      setStrangerTyping(false);
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), text: `${strangerName} left the chat.`, sender: "system", timestamp: new Date() }]);
    });

    return () => {
      socket.off("matched");
      socket.off("message");
      socket.off("typing");
      socket.off("stop-typing");
      socket.off("stranger-left");
    };
  }, [socket, strangerName]);

  const addInterest = (value: string) => {
    const clean = value.trim().slice(0, 24);
    if (!clean) return;
    setSelectedInterests((prev) => (prev.includes(clean) ? prev : [...prev, clean].slice(0, 8)));
    setInterestInput("");
  };

  const startChat = useCallback(() => {
    if (!socket || !canStart) return;
    setStatus("searching");
    setMessages([]);
    setStrangerInfo({});
    setStrangerTyping(false);
    socket.emit("join-queue", { type: "text", nickname: nickname.trim(), interests: selectedInterests });
  }, [socket, canStart, nickname, selectedInterests]);

  const sendMessage = useCallback(() => {
    if (!input.trim() || status !== "connected" || !socket) return;
    const text = input.trim();
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), text, sender: "me", timestamp: new Date() }]);
    socket.emit("message", { text });
    socket.emit("stop-typing");
    setInput("");
    setTyping(false);
    clearTimeout(typingTimeout.current);
  }, [input, status, socket]);

  const handleInput = (value: string) => {
    setInput(value);
    if (!socket || status !== "connected") return;
    if (!typing) {
      socket.emit("typing");
      setTyping(true);
    }
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("stop-typing");
      setTyping(false);
    }, 1200);
  };

  const skipStranger = () => {
    if (!socket) return;
    socket.emit("skip");
    setMessages([]);
    setStrangerInfo({});
    setStrangerTyping(false);
    setStatus("searching");
    socket.emit("join-queue", { type: "text", nickname: nickname.trim(), interests: selectedInterests });
  };

  const endChat = () => {
    socket?.emit("leave");
    setStatus("idle");
    setMessages([]);
    setStrangerInfo({});
    setStrangerTyping(false);
  };

  const reportStranger = () => {
    socket?.emit("report", { reason: "User reported from text chat" });
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), text: "Report sent. You can skip or end this chat.", sender: "system", timestamp: new Date() }]);
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) => (prev.includes(interest) ? prev.filter((item) => item !== interest) : [...prev, interest].slice(0, 8)));
  };

  return (
    <div className="room-bg flex min-h-screen flex-col">
      <div className="room-grid" />
      <header className="relative z-10 border-b border-[#152033]/10 bg-white/90 text-[#152033] backdrop-blur-xl">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/" className="icon-button" aria-label="Back home">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f7c948] text-[#10151d] shadow-[0_12px_26px_rgba(247,201,72,0.24)]">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-black">Text Match</h1>
            <p className="text-xs font-semibold text-[#687386]">Interest-led conversation room</p>
          </div>
          <div className="ml-auto flex items-center gap-2 rounded-full border border-[#152033]/10 bg-white px-3 py-2 text-xs font-black shadow-sm">
            {socketConnected ? <Wifi className="h-4 w-4 text-[#15b86a]" /> : <WifiOff className="h-4 w-4 text-[#e23d3d]" />}
            {socketConnected ? "Online" : "Offline"}
          </div>
        </div>
      </header>

      <div className="relative z-10 grid flex-1 overflow-hidden lg:grid-cols-[360px_1fr]">
        <aside className="hidden border-r border-[#152033]/10 bg-white/50 p-4 text-[#152033] backdrop-blur-xl lg:block">
          <div className="room-card p-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#ffcf56]">
              <Sparkles className="h-4 w-4" />
              Your profile
            </div>
            <label className="mt-4 block">
              <span className="text-xs font-black uppercase tracking-widest text-[#6b7786]">Nickname</span>
              <input value={nickname} onChange={(event) => setNickname(event.target.value.slice(0, 24))} placeholder="Visible to strangers" className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-white px-4 font-black text-[#121820] outline-none focus:border-[#ffcf56]" />
            </label>
            <label className="mt-4 block">
              <span className="text-xs font-black uppercase tracking-widest text-[#6b7786]">Type an interest</span>
              <div className="mt-2 flex gap-2">
                <input value={interestInput} onChange={(event) => setInterestInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addInterest(interestInput)} placeholder="photography, kdrama" className="h-12 min-w-0 flex-1 rounded-xl border border-white/10 bg-white px-4 font-bold text-[#121820] outline-none focus:border-[#ffcf56]" />
                <button onClick={() => addInterest(interestInput)} className="icon-button h-12 w-12" aria-label="Add interest">
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </label>
          </div>

          <div className="room-card mt-4 p-4">
            <div className="text-xs font-black uppercase tracking-widest text-[#6b7786]">Interests</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[...QUICK_INTERESTS, ...selectedInterests].filter((item, index, arr) => arr.indexOf(item) === index).map((interest) => (
                <button key={interest} onClick={() => toggleInterest(interest)} className={`rounded-full border px-3 py-1.5 text-sm font-bold transition ${selectedInterests.includes(interest) ? "border-[#ffcf56] bg-[#ffcf56] text-[#121820]" : "border-[#152033]/10 bg-white text-[#5d6979] hover:text-[#152033]"}`}>
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-[1.5rem] bg-[#f7c948] p-4 text-[#121820] shadow-[0_20px_50px_rgba(247,201,72,0.18)]">
            <div className="flex items-center gap-2 text-sm font-black">
              <Shuffle className="h-4 w-4" />
              Match status
            </div>
            <p className="mt-3 text-sm font-bold opacity-80">
              {status === "connected" ? `Talking with ${strangerName}.` : status === "searching" ? "Searching for a matching room." : "Add a nickname, pick interests, then start."}
            </p>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="border-b border-[#152033]/10 bg-white/75 px-4 py-3 text-[#152033] backdrop-blur-xl">
            <div className="flex flex-wrap items-center gap-2">
              {status === "connected" ? (
                <>
                  <span className="status-online" />
                  <span className="text-sm font-black">{strangerName}</span>
                  {strangerInfo.interests?.map((interest) => (
                    <span key={interest} className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#56616b] shadow-sm">{interest}</span>
                  ))}
                </>
              ) : (
                <span className="text-sm font-bold text-[#687386]">No active stranger yet</span>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-white/60 p-4 text-[#152033]">
            {status === "idle" && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-[#10151d] text-white shadow-xl">
                  <MessageCircle className="h-9 w-9" />
                </div>
                <h2 className="max-w-2xl text-5xl font-black leading-[0.95] tracking-normal">Start with a name, not a blank slate.</h2>
                <p className="mt-4 max-w-lg leading-7 text-[#56616b]">Your nickname appears above the chat so conversations feel less disposable, while your interests help match the room.</p>

                <div className="mt-6 grid w-full gap-3 rounded-2xl border border-[#121820]/10 bg-white p-4 shadow-xl lg:hidden">
                  <input value={nickname} onChange={(event) => setNickname(event.target.value.slice(0, 24))} placeholder="Nickname" className="h-12 rounded-xl border border-[#121820]/10 bg-[#f9f5ed] px-4 font-black outline-none focus:border-[#121820]/30" />
                  <div className="flex gap-2">
                    <input value={interestInput} onChange={(event) => setInterestInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addInterest(interestInput)} placeholder="Type an interest" className="h-12 min-w-0 flex-1 rounded-xl border border-[#121820]/10 bg-[#f9f5ed] px-4 font-bold outline-none focus:border-[#121820]/30" />
                    <button onClick={() => addInterest(interestInput)} className="icon-button h-12 w-12" aria-label="Add interest"><Plus className="h-5 w-5" /></button>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {[...QUICK_INTERESTS, ...selectedInterests].filter((item, index, arr) => arr.indexOf(item) === index).map((interest) => (
                      <button key={interest} onClick={() => toggleInterest(interest)} className={`interest-pill ${selectedInterests.includes(interest) ? "interest-pill-active" : ""}`}>{interest}</button>
                    ))}
                  </div>
                </div>

                <button onClick={startChat} disabled={!canStart} className="primary-button mt-7">
                  <Shuffle className="h-5 w-5" />
                  Start Matching
                </button>
              </motion.div>
            )}

            {status === "searching" && (
              <div className="flex min-h-full flex-col items-center justify-center gap-4 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-xl">
                  <Loader2 className="h-8 w-8 animate-spin text-[#121820]" />
                </div>
                <div>
                  <p className="text-2xl font-black">Finding your next conversation</p>
                  <p className="text-sm font-semibold text-[#68737d]">Matching as {displayName}.</p>
                </div>
                <button onClick={endChat} className="icon-button" aria-label="Cancel search">
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            {(status === "connected" || status === "disconnected") && (
              <div className="mx-auto max-w-4xl space-y-3">
                {messages.map((message) => (
                  <motion.div key={message.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${message.sender === "me" ? "justify-end" : message.sender === "system" ? "justify-center" : "justify-start"}`}>
                    {message.sender === "system" ? (
                      <span className="rounded-full bg-[#121820]/10 px-4 py-2 text-xs font-bold text-[#56616b]">{message.text}</span>
                    ) : (
                      <div className="group max-w-[78%]">
                        <div className={message.sender === "me" ? "chat-bubble-sent shadow-lg" : "chat-bubble-received shadow-lg"}>{message.text}</div>
                        <div className={`mt-1 flex items-center gap-2 opacity-0 transition group-hover:opacity-100 ${message.sender === "me" ? "justify-end" : "justify-start"}`}>
                          <span className="text-xs font-semibold text-[#8a949b]">{message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          <button onClick={() => navigator.clipboard.writeText(message.text)} className="text-[#8a949b] hover:text-[#121820]" aria-label="Copy message">
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}

                {strangerTyping && (
                  <div className="chat-bubble-received flex w-fit items-center gap-1 shadow-lg">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {(status === "connected" || status === "disconnected") && (
            <div className="border-t border-[#152033]/10 bg-white/90 p-3 text-[#152033] backdrop-blur-xl">
              <div className="mx-auto flex max-w-5xl items-center gap-2">
                <button onClick={skipStranger} disabled={status !== "connected"} className="icon-button" aria-label="Skip stranger"><Shuffle className="h-5 w-5" /></button>
                <button onClick={reportStranger} disabled={status !== "connected"} className="icon-button" aria-label="Report stranger"><Flag className="h-5 w-5" /></button>
                <button onClick={endChat} className="icon-button text-[#e23d3d]" aria-label="End chat"><Square className="h-5 w-5" /></button>

                <div className="relative min-w-0 flex-1">
                  <input value={input} onChange={(event) => handleInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && sendMessage()} disabled={status !== "connected"} placeholder={status === "connected" ? `Message ${strangerName}` : "Find a new stranger to continue"} className="h-12 w-full rounded-xl border border-[#121820]/10 bg-white px-4 pr-12 font-semibold outline-none transition focus:border-[#121820]/30 disabled:opacity-60" />
                  <button onClick={() => setShowQuickReplies((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#68737d] hover:text-[#121820]" aria-label="Insert quick text"><Smile className="h-5 w-5" /></button>
                  {showQuickReplies && (
                    <div className="absolute bottom-full right-0 mb-2 grid grid-cols-4 gap-1 rounded-2xl border border-[#121820]/10 bg-white p-2 shadow-xl">
                      {QUICK_REPLIES.map((item) => (
                        <button key={item} onClick={() => { setInput((prev) => `${prev}${prev ? " " : ""}${item}`); setShowQuickReplies(false); }} className="rounded-lg px-2 py-1 text-sm font-black hover:bg-[#f4efe6]">
                          {item}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={sendMessage} disabled={!input.trim() || status !== "connected"} className="coral-button h-12 px-4 bg-[#ff6b4a]" aria-label="Send message"><Send className="h-5 w-5" /></button>
              </div>

              {status === "disconnected" && (
                <div className="mt-3 flex justify-center">
                  <button onClick={startChat} className="primary-button py-2">Find New Stranger</button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
