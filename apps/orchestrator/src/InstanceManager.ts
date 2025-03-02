import { EC2 } from "aws-sdk";
import { redisClient } from "redis-client/client";
import {
  AWS_REGION,
  INSTANCE_TYPE,
  AMI_ID,
  SECURITY_GROUP,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  IDLE_WORKER_THRESHOLD,
} from "./config";

const ec2 = new EC2({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID!,
    secretAccessKey: AWS_SECRET_ACCESS_KEY!,
  },
});

export const monitorIdlePool = async (): Promise<void> => {
  const checkAndLaunchWorkers = async () => {
    const idleWorkersCount = await redisClient.LLEN("idleWorkers");
    console.log(`Idle workers in pool: ${idleWorkersCount}`);

    if (idleWorkersCount < IDLE_WORKER_THRESHOLD) {
      const workersToLaunch = IDLE_WORKER_THRESHOLD - idleWorkersCount;
      for (let i = 0; i < workersToLaunch; i++) {
        const newWorker = await launchInstance();
        if (newWorker) {
          await redisClient.LPUSH("idleWorkers", newWorker);
          console.log(
            `Launched and added new idle worker to pool: ${newWorker}`
          );
        }
      }
    }
  };

  // Run immediately
  await checkAndLaunchWorkers();

  // Set the interval to run every 60 seconds
  setInterval(checkAndLaunchWorkers, 1 * 60000);
};

export const terminateInstance = async (workerId: string): Promise<void> => {
  const params = {
    InstanceIds: [workerId],
  };

  try {
    await ec2.terminateInstances(params).promise();
    console.log(`Terminated worker: ${workerId}`);
  } catch (error) {
    console.error("Error terminating worker instance:", error);
  }
};

const launchInstance = async (): Promise<string | null> => {
  const params = {
    ImageId: AMI_ID,
    InstanceType: INSTANCE_TYPE,
    MinCount: 1,
    MaxCount: 1,
    SecurityGroupIds: [SECURITY_GROUP],
    TagSpecifications: [
      {
        ResourceType: "instance",
        Tags: [{ Key: "Name", Value: `Worker` }],
      },
    ],
  };

  try {
    const result = await ec2.runInstances(params).promise();
    const instanceId = result.Instances?.[0].InstanceId;
    return instanceId || null;
  } catch (error) {
    console.error("Error launching EC2 instance:", error);
    return null;
  }
};
