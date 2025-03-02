import { prismaClient } from "db/client";
import { AutoScalingClient, DescribeAutoScalingGroupsCommand, DetachInstancesCommand } from "@aws-sdk/client-auto-scaling";
import { EC2Client, TerminateInstancesCommand } from "@aws-sdk/client-ec2";

const asgClient = new AutoScalingClient({ region: process.env.AWS_REGION });
const ec2Client = new EC2Client({ region: process.env.AWS_REGION });
const instanceStates = new Map<string, number>();

const BASE_WORKER_DIR = "/tmp/bolty-worker";
const IDLE_TIMEOUT = parseInt(process.env.IDLE_TIMEOUT || '300000');

export async function checkAndScaleASG() {
  try {
    const describeCommand = new DescribeAutoScalingGroupsCommand({
      AutoScalingGroupNames: [process.env.ASG_NAME!]
    });
    const asgInfo = await asgClient.send(describeCommand);

    const instances = asgInfo.AutoScalingGroups?.[0].Instances || [];
    const activeProjects = await prismaClient.project.count();
    const desiredCapacity = Math.ceil(activeProjects / 2);

    const updateCommand = new UpdateAutoScalingGroupCommand({
      AutoScalingGroupName: process.env.ASG_NAME!,
      DesiredCapacity: desiredCapacity,
      MinSize: 1,
      MaxSize: 10
    });
    await asgClient.send(updateCommand);

    for (const instance of instances) {
      if (!instance.InstanceId) continue;

      if (await isInstanceIdle(instance.InstanceId)) {
        const idleSince = instanceStates.get(instance.InstanceId) || Date.now();
        if ((Date.now() - idleSince) > IDLE_TIMEOUT) {
          await drainInstance(instance.InstanceId);
          instanceStates.delete(instance.InstanceId);
        }
      } else {
        instanceStates.delete(instance.InstanceId);
      }
    }
  } catch (error) {
    console.error('ASG Error:', error);
  }
}

async function isInstanceIdle(instanceId: string): Promise<boolean> {
  try {
    const response = await fetch(`http://${instanceId}:${process.env.WORKER_PORT}/health`);
    const data = await response.json();
    return data.status === 'idle' && data.activeTasks === 0;
  } catch {
    return false;
  }
}

async function drainInstance(instanceId: string) {
  try {
    const detachCommand = new DetachInstancesCommand({
      InstanceIds: [instanceId],
      AutoScalingGroupName: process.env.ASG_NAME!,
      ShouldDecrementDesiredCapacity: true
    });
    await asgClient.send(detachCommand);

    const terminateCommand = new TerminateInstancesCommand({ 
      InstanceIds: [instanceId] 
    });
    await ec2Client.send(terminateCommand);
  } catch (error) {
    console.error(`Drain failed for ${instanceId}:`, error);
  }
}

export async function onFileUpdate(filePath: string, fileContent: string, projectId: string) {
  await Bun.write(`${BASE_WORKER_DIR}/${filePath}`, fileContent);
  await prismaClient.action.create({
    data: { projectId, content: `Updated file ${filePath}` }
  });
  await checkAndScaleASG();
}

export async function onShellCommand(shellCommand: string, projectId: string) {
  const commands = shellCommand.split("&&");
  for (const command of commands) {
    Bun.spawnSync({ cmd: command.trim().split(" "), cwd: BASE_WORKER_DIR });
    await prismaClient.action.create({
      data: { projectId, content: `Ran command: ${command}` }
    });
  }
  await checkAndScaleASG();
}

setInterval(checkAndScaleASG, parseInt(process.env.CHECK_INTERVAL || '60000'));