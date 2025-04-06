import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});
redisClient.connect();

export async function addNewPod(pod: string) {
  // add expiry of 5 minutes
  await redisClient.hSet("POD_MAPPING", pod, "empty");
  await redisClient.expire("POD_MAPPING", 300); // expire after 5 minutes
}

export async function removePod(pod: string) {
  await redisClient.hDel("POD_MAPPING", pod);
}

export function getAllPods() {
  return redisClient.hGetAll("POD_MAPPING");
}

export async function addProjectToPod(projectId: string, pod: string) {
  await redisClient.hSet("POD_MAPPING", pod, projectId);
  await redisClient.expire("POD_MAPPING", 300); // expire after 5 minutes
}
