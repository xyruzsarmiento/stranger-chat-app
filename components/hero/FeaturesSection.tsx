"use client";

import { motion } from "framer-motion";
import {
  Video, MessageCircle, Mic, Shield, Globe, Zap,
  Filter, EyeOff, Fingerprint, Headphones
} from "lucide-react";

const features = [
  { icon: Video, title: "HD Video Chat", desc: "Crystal-clear WebRTC video calls with adaptive quality for any connection speed.", color: "purple", tag: "Popular" },
  { icon: MessageCircle, title: "Instant Text Chat", desc: "Real-time messaging with typing indicators, emoji, and message timestamps.", color: "cyan" },
  { icon: Mic, title: "Voice Only Mode", desc: "Audio-only chat with noise suppression and echo cancellation for clear conversations.", color: "pink" },
  { icon: Filter, title: "Interest Matching", desc: "Enter your interests and get matched with people who share your passions.", color: "purple" },
  { icon: Shield, title: "AI Moderation", desc: "24/7 AI content moderation keeps the platform safe and enjoyable for everyone.", color: "green", tag: "Safety" },
  { icon: Globe, title: "Global Reach", desc: "Connect with people from 195+ countries across every time zone, every day.", color: "cyan" },
  { icon: Zap, title: "Instant Matching", desc: "Advanced queue system matches you with a stranger in under 3 seconds on average.", color: "yellow" },
  { icon: EyeOff, title: "Full Anonymity", desc: "No personal data required. Chat as a guest without creating an account.", color: "pink" },
  { icon: Fingerprint, title: "End-to-End Encrypted", desc: "All communications are encrypted end-to-end. Your conversations stay private.", color: "purple" },
];

const colorMap: Record<string, { bg: string; border: string; icon: string; tag: string }> = {
  purple: { bg: "rgba(108,99,255,0.1)", border: "rgba(108,99,255,0.2)", icon: "#8B5CF6", tag: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  cyan: { bg: "rgba(34,211,238,0.1)", border: "rgba(34,211,238,0.2)", icon: "#22D3EE", tag: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
  pink: { bg: "rgba(244,114,182,0.1)", border: "rgba(244,114,182,0.2)", icon: "#F472B6", tag: "bg-pink-500/20 text-pink-300 border-pink-500/30" },
  green: { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.2)", icon: "#22c55e", tag: "bg-green-500/20 text-green-300 border-green-500/30" },
  yellow: { bg: "rgba(234,179,8,0.1)", border: "rgba(234,179,8,0.2)", icon: "#eab308", tag: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
};

export function FeaturesSection() {
  return (
    <section className="relative py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16 section-hidden">
          <p className="text-purple-400 font-semibold text-sm uppercase tracking-widest mb-3">Everything You Need</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Packed with Features</h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            NovaTalk brings a modern, premium experience to random chatting.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const c = colorMap[f.color];
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ delay: (i % 3) * 0.1, duration: 0.5 }}
                className="relative group card-hover glass rounded-2xl p-6 border border-white/5 cursor-default"
                style={{ borderColor: "rgba(255,255,255,0.05)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = c.border;
                  (e.currentTarget as HTMLDivElement).style.background = `linear-gradient(135deg, ${c.bg}, rgba(15,23,42,0.6))`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.05)";
                  (e.currentTarget as HTMLDivElement).style.background = "";
                }}
              >
                {f.tag && (
                  <span className={`absolute top-4 right-4 text-xs px-2 py-0.5 rounded-full border font-medium ${c.tag}`}>
                    {f.tag}
                  </span>
                )}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: c.bg, border: `1px solid ${c.border}` }}
                >
                  <f.icon className="w-6 h-6" style={{ color: c.icon }} />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
