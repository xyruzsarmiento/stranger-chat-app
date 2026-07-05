"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, Video, Mic, User, Settings,
  LogOut, Menu, X, Zap, Shield
} from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Text Chat", href: "/chat/text", icon: MessageCircle },
    { label: "Video Chat", href: "/chat/video", icon: Video },
    { label: "Voice Chat", href: "/chat/voice", icon: Mic },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "glass-strong py-3 border-b border-white/5"
            : "py-5 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl btn-gradient flex items-center justify-center glow-purple">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Nova<span className="gradient-text">Talk</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
              <span className="status-online" />
              <span className="text-green-400 text-xs font-medium">Live</span>
            </div>

            {session ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl glass border border-white/10 hover:border-purple-500/40 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-xs font-bold text-white">
                    {session.user?.name?.[0] ?? "U"}
                  </div>
                  <span className="text-white text-sm font-medium">{session.user?.name?.split(" ")[0]}</span>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 glass-strong rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
                    >
                      <Link href="/profile" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm">
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <Link href="/settings" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm">
                        <Settings className="w-4 h-4" /> Settings
                      </Link>
                      <div className="border-t border-white/5 mx-2" />
                      <button onClick={() => signOut()}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-all text-sm">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="px-5 py-2 rounded-xl btn-gradient text-white text-sm font-semibold"
              >
                <span>Get Started</span>
              </button>
            )}
          </div>

          {/* Mobile menu btn */}
          <button
            className="md:hidden p-2 rounded-xl glass text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed inset-0 z-40 glass-strong md:hidden pt-20 px-4"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-4 rounded-2xl glass text-white text-lg font-medium"
                >
                  <link.icon className="w-5 h-5 text-purple-400" />
                  {link.label}
                </Link>
              ))}
              <div className="mt-4">
                {session ? (
                  <button onClick={() => signOut()} className="w-full px-4 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium">
                    Sign Out
                  </button>
                ) : (
                  <button onClick={() => signIn("google")} className="w-full px-4 py-4 rounded-2xl btn-gradient text-white font-semibold">
                    <span>Get Started Free</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
