import express from "express";
import cors from "cors";
import { authMiddleware } from "common/middleware";
import { monitorIdlePool } from "./InstanceManager";
import { assignWorkerToUser, monitorActiveUsers } from "./workerManager";
import { redisClient } from "redis-client/client";
import { PORT } from "./config";
const app = express();
app.use(express.json());
app.use(cors());

// Join request from frontend/user
app.post("/join",authMiddleware, async (req, res) => {
  const userId=req.userId!;
  if (!userId) {
    res.status(400).json({ message: "Invalid user" });
    return;
  }
  try {
    const alredyAssignedWorker=await redisClient.HGET("activeWorkers",userId);
    if(alredyAssignedWorker){
      res.status(200).json({ message: "Worker already assigned" });
      return;
    }
    const worker = await assignWorkerToUser(userId); // Assign worker from pool or scale up if needed
    res.status(200).json({ workerUrl: worker?.httpUrl, vscodeUrl: worker?.vscodeUrl });
  } catch (error) {
    res.status(500).json({ message: "Error assigning worker" });
  }
});

app.post("/heartbeat/user",authMiddleware,async (req, res) => {
  const { message } = req.body;
  const userId=req.userId!;

  console.log(`Received heartbeat from user ${userId}`);
  if (!userId) {
    res.status(400).json({ message: "Invalid user" });
    return;
  }
  try {
    await redisClient.HSET("activeUsers", userId, Date.now());
    res.sendStatus(200).json({ message: "Pong" });
  }
  catch (error) {
    res.status(500).json({ message: "Error sending heartbeat" });
  }
});

 
app.listen(PORT, async () => {
  console.log(`Orchestrator listening on port ${PORT}`);
  await monitorIdlePool(); // Continuously monitor the idle pool
  await monitorActiveUsers(); // Continuously monitor the active users

});
