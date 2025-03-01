import { AutoScaling } from 'aws-sdk';

// Configure AWS SDK (credentials via env vars or IAM role)
const autoScaling = new AutoScaling({ region: 'us-east-1' }); // Adjust region as needed

export function createASGOrchestrator(
  asgName: string,
  minSize: number,
  maxSize: number,
  idleTimeout: number = 300000 // 5 min default
) {
  // Private state using closure
  const idleWorkers = new Set<string>();

  // Scale up the ASG
  async function scaleUp(count: number = 1): Promise<void> {
    const currentCapacity = await getCurrentDesiredCapacity();
    const newCapacity = Math.min(currentCapacity + count, maxSize);

    if (newCapacity > currentCapacity) {
      const params = {
        AutoScalingGroupName: asgName,
        DesiredCapacity: newCapacity,
      };
      try {
        await autoScaling.setDesiredCapacity(params).promise();
        console.log(`Scaled up ASG ${asgName} to ${newCapacity}`);
      } catch (error) {
        console.error('Scale up error:', error);
      }
    }
  }

  // Get current desired capacity
  async function getCurrentDesiredCapacity(): Promise<number> {
    const params = { AutoScalingGroupNames: [asgName] };
    const response = await autoScaling.describeAutoScalingGroups(params).promise();
    return response.AutoScalingGroups[0]?.DesiredCapacity || minSize;
  }

  // Mark a worker as idle
  async function markWorkerIdle(instanceId: string): Promise<void> {
    idleWorkers.add(instanceId);
    console.log(`Worker ${instanceId} idle`);

    setTimeout(async () => {
      if (idleWorkers.has(instanceId)) {
        await drainWorker(instanceId);
      }
    }, idleTimeout);
  }

  // Mark a worker as active
  async function markWorkerActive(instanceId: string): Promise<void> {
    idleWorkers.delete(instanceId);
    console.log(`Worker ${instanceId} active`);
  }

  // Drain an idle worker
  async function drainWorker(instanceId: string): Promise<void> {
    const params = {
      AutoScalingGroupName: asgName,
      InstanceId: instanceId,
      ShouldDecrementDesiredCapacity: true,
    };

    try {
      await autoScaling.terminateInstanceInAutoScalingGroup(params).promise();
      idleWorkers.delete(instanceId);
      console.log(`Drained worker ${instanceId}`);
    } catch (error) {
      console.error('Drain error:', error);
    }
  }

  // Get running instances
  async function getRunningInstances(): Promise<string[]> {
    const params = { AutoScalingGroupNames: [asgName] };
    const response = await autoScaling.describeAutoScalingGroups(params).promise();
    return response.AutoScalingGroups[0]?.Instances?.map(i => i.InstanceId) || [];
  }

  // Return the orchestrator API
  return {
    scaleUp,
    getCurrentDesiredCapacity,
    markWorkerIdle,
    markWorkerActive,
    drainWorker,
    getRunningInstances,
  };
}