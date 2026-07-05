// server/moderation.js
// Content moderation utilities

const PROFANITY_LIST = [
  // Add words to filter
  "spam", "hack", "scam",
];

const SPAM_PATTERNS = [
  /(.)\1{10,}/,           // Repeated characters
  /https?:\/\/\S+/gi,     // URLs (flag, not always block)
  /\b\d{10,}\b/,          // Long numbers (phone numbers)
];

/**
 * Moderate a text message
 * @param {string} text
 * @returns {{ safe: boolean; filtered: string; flags: string[] }}
 */
function moderateText(text) {
  const flags = [];
  let filtered = text;

  // Profanity filter
  let hasProfanity = false;
  PROFANITY_LIST.forEach((word) => {
    const re = new RegExp(`\\b${word}\\b`, "gi");
    if (re.test(filtered)) {
      hasProfanity = true;
      filtered = filtered.replace(re, "*".repeat(word.length));
    }
  });
  if (hasProfanity) flags.push("profanity");

  // Spam pattern detection
  SPAM_PATTERNS.forEach((pattern) => {
    if (pattern.test(text)) {
      flags.push("spam_pattern");
    }
  });

  // Length check
  if (text.length > 2000) {
    flags.push("too_long");
    filtered = filtered.substring(0, 2000) + "...";
  }

  const safe = flags.length === 0 || (flags.length === 1 && flags[0] === "spam_pattern");

  return { safe, filtered, flags };
}

/**
 * Rate limit check using in-memory store
 */
const messageRates = new Map(); // socketId -> { count, resetAt }

function checkRateLimit(socketId, maxMessages = 20, windowMs = 10_000) {
  const now = Date.now();
  const record = messageRates.get(socketId);

  if (!record || now > record.resetAt) {
    messageRates.set(socketId, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxMessages - 1 };
  }

  if (record.count >= maxMessages) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: maxMessages - record.count };
}

/**
 * Bot detection heuristics
 */
function detectBot(events) {
  // events: array of { type, timestamp }
  if (events.length < 3) return false;

  // Check if messages are perfectly timed (bot-like)
  const intervals = [];
  for (let i = 1; i < events.length; i++) {
    intervals.push(events[i].timestamp - events[i - 1].timestamp);
  }

  const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((sum, i) => sum + Math.pow(i - avg, 2), 0) / intervals.length;

  // Very low variance = likely bot
  return variance < 100 && avg < 500;
}

module.exports = { moderateText, checkRateLimit, detectBot };
