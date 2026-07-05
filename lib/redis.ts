import Redis from "ioredis";

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
      retryStrategy: (times) => Math.min(times * 50, 2000),
      enableOfflineQueue: true,
      maxRetriesPerRequest: 3,
    });

    redis.on("error", (err) => {
      console.error("[Redis] Error:", err.message);
    });

    redis.on("connect", () => {
      console.log("[Redis] Connected");
    });
  }
  return redis;
}

// Queue helpers
export async function addToQueue(
  redis: Redis,
  socketId: string,
  type: string,
  interests: string[]
): Promise<void> {
  const key = `queue:${type}`;
  await redis.lpush(key, JSON.stringify({ socketId, interests, joinedAt: Date.now() }));
}

export async function removeFromQueue(redis: Redis, socketId: string, type: string): Promise<void> {
  const key = `queue:${type}`;
  const items = await redis.lrange(key, 0, -1);
  for (const item of items) {
    const parsed = JSON.parse(item);
    if (parsed.socketId === socketId) {
      await redis.lrem(key, 1, item);
      break;
    }
  }
}

export async function popFromQueue(
  redis: Redis,
  type: string
): Promise<{ socketId: string; interests: string[] } | null> {
  const key = `queue:${type}`;
  const item = await redis.rpop(key);
  return item ? JSON.parse(item) : null;
}

// Online count
export async function incrementOnline(redis: Redis): Promise<void> {
  await redis.incr("stats:online");
}

export async function decrementOnline(redis: Redis): Promise<void> {
  const val = await redis.get("stats:online");
  if (val && parseInt(val) > 0) await redis.decr("stats:online");
}

export async function getOnlineCount(redis: Redis): Promise<number> {
  const val = await redis.get("stats:online");
  return parseInt(val ?? "0");
}
