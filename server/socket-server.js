const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();
const server = http.createServer(app);

// ─── Config ────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.SOCKET_PORT ?? "3001");
const CLIENT_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: { error: "Too many requests" },
  })
);

// ─── Socket.io ──────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ─── In-Memory State ────────────────────────────────────────────────────────
const queues = {
  text: [],   // { socketId, interests, nickname, joinedAt }
  video: [],
  voice: [],
};

const activePairs = new Map(); // socketId -> partnerSocketId
const socketMeta = new Map();  // socketId -> { type, interests, nickname, country }
let onlineCount = 0;
let totalChats = 0;

function cleanNickname(value) {
  const fallback = "Stranger";
  if (typeof value !== "string") return fallback;
  const cleaned = value.replace(/[^\w\s.-]/g, "").replace(/\s+/g, " ").trim().slice(0, 24);
  return cleaned || fallback;
}

function cleanInterests(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value)]
    .filter((item) => typeof item === "string")
    .map((item) => item.replace(/[^\w\s+#.-]/g, "").replace(/\s+/g, " ").trim().slice(0, 24))
    .filter(Boolean)
    .slice(0, 8);
}

// ─── Matching Logic ─────────────────────────────────────────────────────────
function findMatch(queue, seeker) {
  // First try interest match
  const interestMatch = queue.findIndex(
    (q) =>
      q.socketId !== seeker.socketId &&
      q.interests &&
      seeker.interests &&
      q.interests.some((i) => seeker.interests.includes(i))
  );
  if (interestMatch !== -1) return interestMatch;

  // Fallback: any available
  const anyMatch = queue.findIndex((q) => q.socketId !== seeker.socketId);
  return anyMatch;
}

function removeFromQueue(queue, socketId) {
  const idx = queue.findIndex((q) => q.socketId === socketId);
  if (idx !== -1) queue.splice(idx, 1);
}

function removeFromAllQueues(socketId) {
  Object.values(queues).forEach((q) => removeFromQueue(q, socketId));
}

// ─── Profanity Filter ────────────────────────────────────────────────────────
const BAD_WORDS = ["spam", "hate"]; // Extend as needed
function filterMessage(text) {
  let filtered = text;
  BAD_WORDS.forEach((word) => {
    const re = new RegExp(word, "gi");
    filtered = filtered.replace(re, "*".repeat(word.length));
  });
  return filtered;
}

// ─── Socket Events ───────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  onlineCount++;
  console.log(`[Socket] Connected: ${socket.id} | Online: ${onlineCount}`);

  // ── Join queue ──────────────────────────────────────────────────────────
  socket.on("join-queue", ({ type = "text", interests = [], nickname = "Stranger" }) => {
    if (!queues[type]) return;

    const cleanName = cleanNickname(nickname);
    const cleanTags = cleanInterests(interests);

    removeFromAllQueues(socket.id);
    socketMeta.set(socket.id, { type, interests: cleanTags, nickname: cleanName });

    const seeker = { socketId: socket.id, interests: cleanTags, nickname: cleanName, joinedAt: Date.now() };
    const queue = queues[type];

    const matchIdx = findMatch(queue, seeker);

    if (matchIdx !== -1) {
      const partner = queue.splice(matchIdx, 1)[0];
      activePairs.set(socket.id, partner.socketId);
      activePairs.set(partner.socketId, socket.id);
      totalChats++;

      // Notify both
      socket.emit("matched", {
        initiator: true,
        strangerInfo: { interests: partner.interests, nickname: partner.nickname },
      });
      io.to(partner.socketId).emit("matched", {
        initiator: false,
        strangerInfo: { interests: cleanTags, nickname: cleanName },
      });

      console.log(`[Match] ${socket.id} <-> ${partner.socketId} (${type})`);
    } else {
      queue.push(seeker);
      console.log(`[Queue] ${socket.id} waiting in ${type} queue (size: ${queue.length})`);
    }
  });

  // ── WebRTC Signaling ─────────────────────────────────────────────────────
  socket.on("signal", ({ signal }) => {
    const partner = activePairs.get(socket.id);
    if (partner) io.to(partner).emit("signal", { signal });
  });

  // ── Messages ──────────────────────────────────────────────────────────────
  socket.on("message", ({ text }) => {
    const partner = activePairs.get(socket.id);
    if (!partner || !text || text.length > 2000) return;
    const filtered = filterMessage(text.trim());
    io.to(partner).emit("message", { text: filtered });
  });

  // ── Typing indicators ─────────────────────────────────────────────────────
  socket.on("typing", () => {
    const partner = activePairs.get(socket.id);
    if (partner) io.to(partner).emit("typing");
  });

  socket.on("stop-typing", () => {
    const partner = activePairs.get(socket.id);
    if (partner) io.to(partner).emit("stop-typing");
  });

  // ── Skip ─────────────────────────────────────────────────────────────────
  socket.on("skip", () => {
    const partner = activePairs.get(socket.id);
    if (partner) {
      io.to(partner).emit("stranger-left");
      activePairs.delete(partner);
    }
    activePairs.delete(socket.id);
  });

  // ── Leave ─────────────────────────────────────────────────────────────────
  socket.on("leave", () => {
    const partner = activePairs.get(socket.id);
    if (partner) {
      io.to(partner).emit("stranger-left");
      activePairs.delete(partner);
    }
    activePairs.delete(socket.id);
    removeFromAllQueues(socket.id);
  });

  // ── Report ───────────────────────────────────────────────────────────────
  socket.on("report", ({ reason }) => {
    const partner = activePairs.get(socket.id);
    if (!partner || !reason) return;
    console.log(`[Report] ${socket.id} reported ${partner} for: ${reason}`);
    // In production: save to DB
  });

  // ── Disconnect ────────────────────────────────────────────────────────────
  socket.on("disconnect", (reason) => {
    onlineCount = Math.max(0, onlineCount - 1);
    console.log(`[Socket] Disconnected: ${socket.id} (${reason}) | Online: ${onlineCount}`);

    const partner = activePairs.get(socket.id);
    if (partner) {
      io.to(partner).emit("stranger-left");
      activePairs.delete(partner);
    }
    activePairs.delete(socket.id);
    removeFromAllQueues(socket.id);
    socketMeta.delete(socket.id);
  });
});

// ─── REST Endpoints ─────────────────────────────────────────────────────────
app.get("/health", (_, res) => res.json({ status: "ok", uptime: process.uptime() }));

app.get("/stats", (_, res) => {
  res.json({
    online: onlineCount,
    totalChats,
    queues: {
      text: queues.text.length,
      video: queues.video.length,
      voice: queues.voice.length,
    },
    activePairs: activePairs.size / 2,
  });
});

// ─── Start ───────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`\n🚀 Socket server running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Stats:  http://localhost:${PORT}/stats\n`);
});

module.exports = { app, server, io };
