"use client";

import { useApp } from "@/components/Providers";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Star, Twitter, Github, MessageSquare } from "lucide-react";

/* ─── Stats ─────────────────────────────────────────────────────────────── */
export function StatsSection() {
  const { onlineCount, activeChats } = useApp();

  const stats = [
    { label: "Users Online", value: onlineCount.toLocaleString(), suffix: "", color: "text-green-400", desc: "Right now, live" },
    { label: "Active Chats", value: activeChats.toLocaleString(), suffix: "", color: "text-purple-400", desc: "Ongoing conversations" },
    { label: "Total Users", value: "2.4", suffix: "M+", color: "text-cyan-400", desc: "Registered worldwide" },
    { label: "Countries", value: "195", suffix: "+", color: "text-pink-400", desc: "Global community" },
  ];

  return (
    <section className="relative py-20">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-cyan-900/20" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="glass-strong rounded-3xl border border-purple-500/10 p-10 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className={`text-4xl sm:text-5xl font-black ${stat.color} tabular-nums mb-1`}>
                {stat.value}<span className="text-3xl">{stat.suffix}</span>
              </div>
              <div className="text-white font-semibold text-sm mb-1">{stat.label}</div>
              <div className="text-slate-500 text-xs">{stat.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ───────────────────────────────────────────────────────── */
const testimonials = [
  { name: "Alex K.", country: "🇺🇸 United States", text: "Finally a modern Omegle alternative! The video quality is amazing and I've made friends from Japan and Brazil.", stars: 5, avatar: "A" },
  { name: "Mei L.", country: "🇯🇵 Japan", text: "The interest matching feature is genius. I was paired with other anime fans instantly. Love this platform!", stars: 5, avatar: "M" },
  { name: "Carlos R.", country: "🇧🇷 Brazil", text: "Interface is so clean and professional. Finally a chat platform that takes safety seriously. 10/10.", stars: 5, avatar: "C" },
  { name: "Priya S.", country: "🇮🇳 India", text: "Used this to practice my English. People are friendly and the text chat is really smooth. Highly recommend!", stars: 5, avatar: "P" },
  { name: "Tom W.", country: "🇬🇧 UK", text: "Switched from Omegle and never looked back. The dark UI is gorgeous and the experience is so much better.", stars: 5, avatar: "T" },
];

export function TestimonialsSection() {
  const [active, setActive] = useState(0);

  return (
    <section className="py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 section-hidden">
          <p className="text-purple-400 font-semibold text-sm uppercase tracking-widest mb-3">Real People, Real Stories</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white">Loved Worldwide</h2>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4 }}
              className="glass-strong rounded-3xl p-8 sm:p-12 border border-white/5 text-center"
            >
              <div className="flex justify-center gap-1 mb-6">
                {Array.from({ length: testimonials[active].stars }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-xl sm:text-2xl text-white font-medium leading-relaxed mb-8">
                &ldquo;{testimonials[active].text}&rdquo;
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white font-bold">
                  {testimonials[active].avatar}
                </div>
                <div className="text-left">
                  <div className="text-white font-semibold">{testimonials[active].name}</div>
                  <div className="text-slate-400 text-sm">{testimonials[active].country}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === active ? "w-8 h-2 bg-purple-500" : "w-2 h-2 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ────────────────────────────────────────────────────────────────── */
const faqs = [
  { q: "Is NovaTalk free to use?", a: "Yes! NovaTalk is completely free. You can start chatting immediately without creating an account." },
  { q: "Do I need a camera for video chat?", a: "A camera is recommended for video chat, but you can still connect in text-only or voice-only mode if you prefer." },
  { q: "How does the matching work?", a: "Our matching engine pairs you randomly with an online stranger. If you add interests, we'll try to match you with someone who shares them." },
  { q: "Is my chat private?", a: "All chats are end-to-end encrypted and anonymous by default. We do not record conversations." },
  { q: "What happens if someone is inappropriate?", a: "Use the report button to flag bad behavior. Our AI moderation + human review team will take swift action." },
  { q: "Can I use NovaTalk on mobile?", a: "Absolutely. NovaTalk is fully responsive and works on iOS and Android browsers with full video support." },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 section-hidden">
          <p className="text-purple-400 font-semibold text-sm uppercase tracking-widest mb-3">Common Questions</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white">FAQ</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className={`w-full text-left glass rounded-2xl px-6 py-5 border transition-all duration-300 ${
                  open === i ? "border-purple-500/30" : "border-white/5 hover:border-white/10"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-white font-medium">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-purple-400 flex-shrink-0 transition-transform duration-300 ${open === i ? "rotate-180" : ""}`} />
                </div>
                <AnimatePresence>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="text-slate-400 pt-3 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────────────── */
export function Footer() {
  return (
    <footer className="border-t border-white/5 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl btn-gradient flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="text-white font-bold text-lg">NovaTalk</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">
              The modern stranger chat platform. Safe, free, and beautiful.
            </p>
            <div className="flex gap-3">
              {[Twitter, Github, MessageSquare].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-xl glass border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:border-purple-500/30 transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {[
            { title: "Product", links: ["Text Chat", "Video Chat", "Voice Chat", "Interest Matching"] },
            { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
            { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Contact"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-semibold text-sm mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-sm">© 2024 NovaTalk. All rights reserved.</p>
          <div className="flex items-center gap-2 text-slate-600 text-sm">
            <span className="status-online w-2 h-2" />
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
