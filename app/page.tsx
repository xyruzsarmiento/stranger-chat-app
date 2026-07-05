"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeDollarSign,
  MessageCircle,
  Mic,
  Play,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Video,
  Zap,
} from "lucide-react";
import { useApp } from "@/components/Providers";

const modes = [
  {
    title: "Text",
    href: "/chat/text",
    icon: MessageCircle,
    detail: "Interest-led conversation rooms",
    accent: "bg-[#f6c84f] text-[#152033]",
  },
  {
    title: "Video",
    href: "/chat/video",
    icon: Video,
    detail: "Face-to-face matches with quick exits",
    accent: "bg-[#ff765c] text-white",
  },
  {
    title: "Voice",
    href: "/chat/voice",
    icon: Mic,
    detail: "Audio rooms without camera pressure",
    accent: "bg-[#25c7b8] text-[#071414]",
  },
];

const stats = [
  ["Active chats", "activeChats"],
  ["Interest lanes", "12"],
  ["Exit delay", "0s"],
];

export default function HomePage() {
  const { onlineCount, activeChats } = useApp();

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f3ea] text-[#152033]">
      <header className="sticky top-0 z-50 border-b border-[#152033]/10 bg-[#fbf8f1]/88 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#152033] text-white shadow-[0_12px_26px_rgba(21,32,51,0.18)]">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="text-xl font-black tracking-tight">NovaTalk</span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-[#152033]/10 bg-white p-1 shadow-sm md:flex">
            {modes.map((mode) => (
              <Link
                key={mode.href}
                href={mode.href}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black text-[#536173] transition hover:bg-[#152033] hover:text-white"
              >
                <mode.icon className="h-4 w-4" />
                {mode.title}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 rounded-full border border-[#152033]/10 bg-white px-3 py-2 text-sm font-black shadow-sm">
            <span className="status-online" />
            {onlineCount.toLocaleString()} live
          </div>
        </div>
      </header>

      <section className="relative">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#fffaf0_0%,#f6efe4_42%,#eef9f6_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(21,32,51,.055)_1px,transparent_1px),linear-gradient(90deg,rgba(21,32,51,.055)_1px,transparent_1px)] bg-[length:48px_48px]" />

        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-2xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#152033]/10 bg-white/90 px-4 py-2 text-sm font-black shadow-sm backdrop-blur">
              <Zap className="h-4 w-4 text-[#ff765c]" />
              Random chat with a cleaner first hello
            </div>
            <h1 className="max-w-[760px] text-[clamp(3rem,7vw,6.4rem)] font-black leading-[0.94] tracking-normal text-[#101827]">
              Meet someone new without the blank-room feeling.
            </h1>
            <p className="mt-6 max-w-xl text-lg font-semibold leading-8 text-[#536173]">
              NovaTalk brings text, video, and voice matching into one polished room with interests, clear controls, and calm exits.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/chat/video" className="coral-button px-6">
                <Video className="h-5 w-5" />
                Start video
              </Link>
              <Link href="/chat/text" className="primary-button bg-white text-[#152033] shadow-[0_16px_34px_rgba(21,32,51,0.10)] hover:bg-[#f8fafc]">
                <MessageCircle className="h-5 w-5" />
                Start text
              </Link>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 divide-x divide-[#152033]/12 border-y border-[#152033]/12 py-4">
              {stats.map(([label, value]) => (
                <div key={label} className="px-4 first:pl-0">
                  <div className="text-2xl font-black">{value === "activeChats" ? activeChats.toLocaleString() : value}</div>
                  <div className="mt-1 text-[11px] font-black uppercase tracking-widest text-[#6b7786]">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.12, duration: 0.55 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-[2rem] border border-[#152033]/10 bg-white p-3 shadow-[0_30px_90px_rgba(21,32,51,0.16)]">
              <div className="flex items-center justify-between border-b border-[#152033]/10 px-3 py-3 text-xs font-black uppercase tracking-widest text-[#7a8592]">
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#ff765c]" />
                  <span className="h-3 w-3 rounded-full bg-[#f6c84f]" />
                  <span className="h-3 w-3 rounded-full bg-[#25c7b8]" />
                </span>
                <span>NovaTalk live desk</span>
                <span className="flex items-center gap-2 text-[#159b62]"><span className="status-online" />Live</span>
              </div>

              <div className="grid gap-3 p-1 lg:grid-cols-[1fr_250px]">
                <div className="relative min-h-[420px] overflow-hidden rounded-[1.35rem] bg-[#f4f0e8]">
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,118,92,.18),transparent_44%),linear-gradient(315deg,rgba(37,199,184,.18),transparent_48%)]" />
                  <div className="absolute left-5 top-5 rounded-full border border-[#152033]/10 bg-white/80 px-4 py-2 text-sm font-black text-[#152033] shadow-sm backdrop-blur">
                    Mira joined Music
                  </div>
                  <div className="absolute inset-x-6 bottom-6 rounded-[1.25rem] border border-[#152033]/10 bg-white/90 p-4 text-[#152033] shadow-xl backdrop-blur-xl">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xl font-black">Room warming up</div>
                        <div className="mt-1 text-sm font-semibold text-[#667386]">Camera, chat, and skip controls in one reach.</div>
                      </div>
                      <button className="grid h-12 w-12 place-items-center rounded-xl bg-[#152033] text-white" aria-label="Preview play">
                        <Play className="h-5 w-5 fill-current" />
                      </button>
                    </div>
                  </div>
                </div>

                <aside className="grid gap-3">
                  <div className="rounded-[1.35rem] border border-[#152033]/10 bg-[#fbf8f1] p-4 text-[#152033]">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#6a7684]">
                      <BadgeDollarSign className="h-4 w-4 text-[#0a73ff]" />
                      Support the owner
                    </div>
                    <div className="mt-4 overflow-hidden rounded-2xl border border-[#0a73ff]/15 bg-white p-3 shadow-inner">
                      <img src="/donation-qr.svg" alt="GCash donation QR code" className="mx-auto aspect-square w-full max-w-[178px] rounded-xl object-contain" />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-black">GCash donation</div>
                        <div className="text-xs font-bold text-[#6a7684]">Scan to keep the rooms online.</div>
                      </div>
                      <ScanLine className="h-5 w-5 text-[#0a73ff]" />
                    </div>
                  </div>

                  <div className="rounded-[1.35rem] bg-[#f6c84f] p-4 text-[#152033]">
                    <div className="text-xs font-black uppercase tracking-widest opacity-60">Text pulse</div>
                    <div className="mt-4 space-y-2">
                      <div className="w-[88%] rounded-2xl rounded-bl-md bg-white px-3 py-2 text-sm font-black">Anyone up for films?</div>
                      <div className="ml-auto w-[80%] rounded-2xl rounded-br-md bg-[#152033] px-3 py-2 text-sm font-black text-white">Yes, sci-fi first.</div>
                    </div>
                  </div>

                  <div className="rounded-[1.35rem] border border-[#152033]/10 bg-white p-4 text-[#152033]">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#6a7684]">
                      <ShieldCheck className="h-4 w-4 text-[#25c7b8]" />
                      Safer exits
                    </div>
                    <div className="mt-5 flex h-24 items-end justify-center gap-2">
                      {[44, 76, 55, 96, 68, 36, 82].map((height, index) => (
                        <span key={index} className="w-4 rounded-full bg-[#25c7b8]" style={{ height }} />
                      ))}
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 border-t border-[#152033]/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
          {modes.map((mode) => (
            <Link key={mode.href} href={mode.href} className="group rounded-2xl border border-[#152033]/10 bg-[#fbf8f1] p-5 shadow-sm transition hover:-translate-y-1 hover:bg-white hover:shadow-xl">
              <span className={`grid h-11 w-11 place-items-center rounded-xl ${mode.accent}`}>
                <mode.icon className="h-5 w-5" />
              </span>
              <span className="mt-4 flex items-center justify-between gap-3 text-lg font-black">
                {mode.title}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
              <span className="mt-1 block text-sm font-semibold leading-6 text-[#627083]">{mode.detail}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
