"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Video, MessageCircle, ArrowRight, Sparkles } from "lucide-react";
import { useApp } from "@/components/Providers";

const PARTICLE_COUNT = 50;

function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number; color: string }[] = [];
    const colors = ["rgba(108,99,255,", "rgba(34,211,238,", "rgba(244,114,182,"];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let animFrame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.alpha + ")";
        ctx.fill();

        // Draw lines between nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - p.x;
          const dy = particles[j].y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(108,99,255,${0.1 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animFrame = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}

export function HeroSection() {
  const { onlineCount, activeChats } = useApp();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-[120px] animate-blob" />
        <div className="absolute top-20 -right-40 w-[500px] h-[500px] rounded-full bg-cyan-400/15 blur-[120px] animate-blob-delayed" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-pink-500/10 blur-[120px] animate-blob-delayed2" />
      </div>

      <ParticleBackground />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(108,99,255,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(108,99,255,0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center pt-28 pb-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-purple-500/30 mb-8"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-purple-300 font-medium">
            {onlineCount.toLocaleString()} people online right now
          </span>
          <span className="status-online" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-5xl sm:text-7xl lg:text-8xl font-bold text-white leading-[1.05] tracking-tight mb-6"
        >
          Meet New People{" "}
          <span className="block gradient-text glow-text-purple">Instantly</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Connect with strangers worldwide through video, voice, and text chat in seconds.
          Safe, modern, and completely free.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link href="/chat/video" className="group relative">
            <div className="absolute inset-0 rounded-2xl btn-gradient blur-lg opacity-60 group-hover:opacity-90 transition-opacity" />
            <div className="relative flex items-center gap-3 px-8 py-4 rounded-2xl btn-gradient text-white font-semibold text-lg shadow-lg">
              <span>
                <Video className="w-5 h-5" />
              </span>
              <span>Start Video Chat</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/chat/text"
            className="flex items-center gap-3 px-8 py-4 rounded-2xl glass border border-white/10 hover:border-purple-500/40 text-white font-semibold text-lg transition-all hover:bg-white/5"
          >
            <MessageCircle className="w-5 h-5 text-purple-400" />
            Start Text Chat
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="flex flex-wrap items-center justify-center gap-8"
        >
          {[
            { label: "Online Now", value: onlineCount.toLocaleString(), color: "text-green-400" },
            { label: "Active Chats", value: activeChats.toLocaleString(), color: "text-purple-400" },
            { label: "Total Users", value: "2.4M+", color: "text-cyan-400" },
            { label: "Countries", value: "195+", color: "text-pink-400" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className={`text-2xl font-bold ${stat.color} tabular-nums`}>{stat.value}</div>
              <div className="text-slate-500 text-sm mt-0.5">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Floating UI mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
          className="mt-20 relative mx-auto max-w-4xl"
        >
          <div className="glass-strong rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            {/* Mock video chat UI */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4">
              <div className="flex items-center justify-between mb-3 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="text-xs text-slate-500 font-mono">novatalk.app/chat/video</div>
                <div className="flex items-center gap-1 text-green-400 text-xs">
                  <span className="status-online w-2 h-2" />
                  Connected
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 h-48 sm:h-64">
                <div className="rounded-2xl bg-gradient-to-br from-purple-900/50 to-slate-900 flex items-center justify-center relative overflow-hidden">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-2xl font-bold text-white">S</div>
                  <div className="absolute bottom-3 left-3 text-xs text-white bg-black/40 px-2 py-1 rounded-lg">Stranger</div>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative overflow-hidden">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white">Y</div>
                  <div className="absolute bottom-3 left-3 text-xs text-white bg-black/40 px-2 py-1 rounded-lg">You</div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 mt-4">
                {["🎙", "📹", "💬", "⏭", "🔴"].map((emoji, i) => (
                  <button key={i} className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${i === 4 ? "bg-red-500" : "glass hover:bg-white/10"}`}>
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Floating notification cards */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-4 sm:-left-16 top-12 glass-strong rounded-2xl p-3 border border-purple-500/20 hidden sm:block"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-cyan-400" />
              <div>
                <div className="text-white text-xs font-medium">Stranger connected</div>
                <div className="text-slate-400 text-xs">Tokyo, Japan 🇯🇵</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -right-4 sm:-right-16 bottom-20 glass-strong rounded-2xl p-3 border border-cyan-500/20 hidden sm:block"
          >
            <div className="flex items-center gap-2">
              <div className="text-xl">🔒</div>
              <div>
                <div className="text-white text-xs font-medium">End-to-end encrypted</div>
                <div className="text-slate-400 text-xs">Your privacy is protected</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
