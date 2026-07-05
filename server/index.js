const express = require("express");
const http = require("http");
const next = require("next");
const { Server } = require("socket.io");
const rateLimit = require("express-rate-limit");

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev });
const handle = app.getRequestHandler();

const queues = {
  text: [],
  video: [],
  voice: [],
};

const activePairs = new Map();
const socketMeta = new Map();
let onlineCount = 0;
let totalChats = 0;

function cleanNickname(value) {
  if (typeof value !== "string") return "Stranger";
  const cleaned = value.replace(/[^\w\s.-]/g, "").replace(/\s+/g, " ").trim().slice(0, 24);
  return cleaned || "Stranger";
}

function cleanInterests(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value)]
    .filter((item) => typeof item === "string")
    .map((item) => item.replace(/[^\w\s+#.-]/g, "").replace(/\s+/g, " ").trim().slice(0, 24))
    .filter(Boolean)
    .slice(0, 8);
}

function findMatch(queue, seeker) {
  const interestMatch = queue.findIndex(
    (item) =>
      item.socketId !== seeker.socketId &&
      item.interests.some((interest) => seeker.interests.includes(interest))
  );
  if (interestMatch !== -1) return interestMatch;
  return queue.findIndex((item) => item.socketId !== seeker.socketId);
}

function removeFromQueue(queue, socketId) {
  const index = queue.findIndex((item) => item.socketId === socketId);
  if (index !== -1) queue.splice(index, 1);
}

function removeFromAllQueues(socketId) {
  Object.values(queues).forEach((queue) => removeFromQueue(queue, socketId));
}

function disconnectPair(socket, io) {
  const partner = activePairs.get(socket.id);
  if (partner) {
    io.to(partner).emit("stranger-left");
    activePairs.delete(partner);
  }
  activePairs.delete(socket.id);
}

function filterMessage(text) {
  return ["spam", "hate"].reduce(
    (value, word) => value.replace(new RegExp(word, "gi"), "*".repeat(word.length)),
    text
  );
}

app.prepare().then(() => {
  const expressApp = express();
  const server = http.createServer(expressApp);
  const io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || true,
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  expressApp.use(express.json());
  expressApp.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 100,
      message: { error: "Too many requests" },
    })
  );

  io.on("connection", (socket) => {
    onlineCount++;
    console.log(`[Socket] Connected: ${socket.id} | Online: ${onlineCount}`);

    socket.on("join-queue", ({ type = "text", interests = [], nickname = "Stranger" }) => {
      if (!queues[type]) return;

      const cleanName = cleanNickname(nickname);
      const cleanTags = cleanInterests(interests);
      const seeker = { socketId: socket.id, interests: cleanTags, nickname: cleanName, joinedAt: Date.now() };
      const queue = queues[type];
      const matchIndex = findMatch(queue, seeker);

      removeFromAllQueues(socket.id);
      socketMeta.set(socket.id, { type, interests: cleanTags, nickname: cleanName });

      if (matchIndex !== -1) {
        const partner = queue.splice(matchIndex, 1)[0];
        activePairs.set(socket.id, partner.socketId);
        activePairs.set(partner.socketId, socket.id);
        totalChats++;

        socket.emit("matched", {
          initiator: true,
          strangerInfo: { interests: partner.interests, nickname: partner.nickname },
        });
        io.to(partner.socketId).emit("matched", {
          initiator: false,
          strangerInfo: { interests: cleanTags, nickname: cleanName },
        });
      } else {
        queue.push(seeker);
      }
    });

    socket.on("signal", ({ signal }) => {
      const partner = activePairs.get(socket.id);
      if (partner) io.to(partner).emit("signal", { signal });
    });

    socket.on("message", ({ text }) => {
      const partner = activePairs.get(socket.id);
      if (!partner || typeof text !== "string" || text.length > 2000) return;
      io.to(partner).emit("message", { text: filterMessage(text.trim()) });
    });

    socket.on("typing", () => {
      const partner = activePairs.get(socket.id);
      if (partner) io.to(partner).emit("typing");
    });

    socket.on("stop-typing", () => {
      const partner = activePairs.get(socket.id);
      if (partner) io.to(partner).emit("stop-typing");
    });

    socket.on("skip", () => disconnectPair(socket, io));
    socket.on("leave", () => {
      disconnectPair(socket, io);
      removeFromAllQueues(socket.id);
    });

    socket.on("report", ({ reason }) => {
      const partner = activePairs.get(socket.id);
      if (partner && reason) console.log(`[Report] ${socket.id} reported ${partner} for: ${reason}`);
    });

    socket.on("disconnect", (reason) => {
      onlineCount = Math.max(0, onlineCount - 1);
      console.log(`[Socket] Disconnected: ${socket.id} (${reason}) | Online: ${onlineCount}`);
      disconnectPair(socket, io);
      removeFromAllQueues(socket.id);
      socketMeta.delete(socket.id);
    });
  });

  expressApp.get("/health", (_, res) => res.json({ status: "ok", uptime: process.uptime() }));
  expressApp.get("/stats", (_, res) => {
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

  expressApp.all("*", (req, res) => handle(req, res));

  server.listen(port, () => {
    console.log(`NovaTalk ready on http://localhost:${port}`);
  });
});
