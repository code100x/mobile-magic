import { redisClient } from "redis-client/client";
import { terminateInstance } from "./InstanceManager";

interface WorkerURLs {
  vscodeUrl: string;
  httpUrl: string;
  expoUrl: string;
}

export const assignWorkerToUser = async (
  userId: string
): Promise<WorkerURLs | null> => {
  const idleWorkerId = await redisClient.RPOP("idleWorkers"); // Get an idle worker from the pool

  if (idleWorkerId) {
    // Fetch the corresponding URLs for the worker
    // const vscodeUrl = await redisClient.HGET(`worker:${idleWorkerId}`, 'vscodeUrl');
    // const httpUrl = await redisClient.HGET(`worker:${idleWorkerId}`, 'httpUrl');
    // const expoUrl = await redisClient.HGET(`worker:${idleWorkerId}`, 'expoUrl');

    const vscodeUrl = "http://localhost:8080";
    const httpUrl = "http://localhost:9091";
    const expoUrl = "http://localhost:19002";

    if (vscodeUrl && httpUrl && expoUrl) {
      // Map user to the active worker
      await redisClient.HSET("activeWorkers", userId, idleWorkerId);
      console.log(`Assigned worker ${idleWorkerId} to user ${userId}`);

      // Return the worker's URLs
      return {
        vscodeUrl,
        httpUrl,
        expoUrl,
      };
    } else {
      console.log(`Worker ${idleWorkerId} is missing required URLs`);
      return null;
    }
  } else {
    console.log(`No idle workers available, please wait or scale up`);
    return null;
  }
};

export const monitorActiveUsers = async (): Promise<void> => {
  const checkAndRemoveInactiveUsers = async () => {
    const activeUsers = await redisClient.HGETALL("activeUsers");
    console.log(`Active users: ${JSON.stringify(activeUsers)}`);
    const currentTime = Date.now();

    for (const [userId, lastHeartbeat] of Object.entries(activeUsers)) {
      if (currentTime - parseInt(lastHeartbeat) > 30000) {
        console.log(`Removing inactive user ${userId}`);
        await removeWorkerFromUser(userId);
      }
    }
  };

  // Run immediately
  await checkAndRemoveInactiveUsers();

  // Set the interval to run every 30 seconds
  setInterval(checkAndRemoveInactiveUsers, 30 * 1000);
}
export const removeWorkerFromUser = async (userId: string): Promise<void> => {
  try {
    const workerId = await redisClient.HGET("activeWorkers", userId);
    if (workerId) {
      await terminateInstance(workerId!);
      await redisClient.HDEL("activeWorkers", userId);
      await redisClient.HDEL("activeUsers", userId);
      console.log(`Removed worker ${workerId} from user ${userId}`);
    }
  } catch (error) {
    console.error("Error removing worker from user:", error);
  }
};

