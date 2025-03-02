import { createClient } from "redis";

let clientInstance: ReturnType<typeof createClient>;

const initializeRedisClient = (): ReturnType<typeof createClient> => {
  if (!clientInstance) {
    clientInstance = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });

    clientInstance.on("error", (err) => {
      console.error("Redis Client Error", err);
    });

    clientInstance.connect().catch((err) => console.error("Failed to connect to Redis", err));
  }
  
  return clientInstance;
};

// Export the initialized Redis client as a singleton
export const redisClient = initializeRedisClient();
