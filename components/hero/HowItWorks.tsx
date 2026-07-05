"use client";

import { motion } from "framer-motion";
import { MousePointer2, Users, Smile } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: MousePointer2,
    title: "Start Chat",
    desc: "Click Start Video Chat or Text Chat. No account required — just jump in as a guest in seconds.",
    color: "from-purple-500 to-violet-600",
    glow: "rgba(108,99,255,0.4)",
  },
  {
    step: "02",
    icon: Users,
    title: "Get Matched",
    desc: "Our smart matching engine pairs you with a random stranger instantly, filtered by your interests.",
    color: "from-cyan-400 to-blue-500",
    glow: "rgba(34,211,238,0.4)",
  },
  {
    step: "03",
    icon: Smile,
    title: "Meet New People",
    desc: "Chat, laugh, share, and connect. Skip anytime to meet someone new from anywhere in the world.",
    color: "from-pink-400 to-rose-500",
    glow: "rgba(244,114,182,0.4)",
  },
];

export function HowItWorks() {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-transparent" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16 section-hidden">
          <p className="text-purple-400 font-semibold text-sm uppercase tracking-widest mb-3">Simple as 1-2-3</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Get connected with someone new in under 10 seconds. No setup. No waiting.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="relative group"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[calc(100%+1rem)] w-8 h-px bg-gradient-to-r from-white/20 to-transparent z-10" />
              )}

              <div className="glass rounded-3xl p-8 border border-white/5 hover:border-purple-500/20 transition-all duration-500 group-hover:-translate-y-2 h-full">
                <div className="relative mb-6">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4`}
                    style={{ boxShadow: `0 0 30px ${step.glow}` }}
                  >
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <span className="absolute top-0 right-0 text-6xl font-black text-white/5 leading-none select-none">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
