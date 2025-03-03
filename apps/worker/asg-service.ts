
import {
    AutoScalingClient,
    DescribeAutoScalingGroupsCommand,
    UpdateAutoScalingGroupCommand,
    DetachInstancesCommand,
    SetDesiredCapacityCommand,
    CompleteLifecycleActionCommand,
  } from "@aws-sdk/client-auto-scaling";
  import {
    EC2Client,
    TerminateInstancesCommand,
    DescribeInstancesCommand,
  } from "@aws-sdk/client-ec2";
  import { prismaClient } from "db/client";
  import { logger, metrics } from "./monitoring";
  import { config } from "dotenv";
  
  config();
  
  interface InstanceHealth {
    status: 'healthy' | 'unhealthy';
    healthyInstances: number;
  }
  
  export class ASGService {
    private asgClient: AutoScalingClient;
    private ec2Client: EC2Client;
    private activityTimers: Map<string, NodeJS.Timeout> = new Map();
  
    constructor(private asgName: string) {
      this.asgClient = new AutoScalingClient({
        region: process.env.AWS_REGION,
      });
      this.ec2Client = new EC2Client({ 
        region: process.env.AWS_REGION 
      });
    }
  
    public async checkClusterHealth(): Promise<InstanceHealth> {
      try {
        const instances = await this.getActiveInstances();
        return {
          status: 'healthy',
          healthyInstances: instances.length
        };
      } catch (error) {
        logger.error('Cluster health check failed', { error });
        return { status: 'unhealthy', healthyInstances: 0 };
      }
    }
  
    public async getActiveInstances(): Promise<string[]> {
      const command = new DescribeAutoScalingGroupsCommand({
        AutoScalingGroupNames: [this.asgName]
      });
      
      const response = await this.asgClient.send(command);
      return response.AutoScalingGroups?.[0].Instances?.map(i => i.InstanceId!) || [];
    }
  
    public async optimizeCluster(): Promise<void> {
      try {
        const [projects, activeInstances] = await Promise.all([
          prismaClient.project.count(),
          this.getActiveInstances()
        ]);
        
        const desired = Math.min(Math.ceil(projects / 5), 10);
        const current = activeInstances.length;
  
        if (desired !== current) {
          await this.asgClient.send(new UpdateAutoScalingGroupCommand({
            AutoScalingGroupName: this.asgName,
            DesiredCapacity: desired,
            MinSize: 1,
            MaxSize: 10
          }));
          logger.info(`Cluster optimized from ${current} to ${desired} instances`);
        }
      } catch (error) {
        logger.error('Cluster optimization failed', { error });
        throw error;
      }
    }
  
    public async drainInstance(instanceId: string): Promise<void> {
      try {
        logger.info(`Starting drain process for instance ${instanceId}`);
  
        
        await prismaClient.workerInstance.update({
          where: { instanceId },
          data: { status: 'DRAINING' }
        });
  
       
        await this.waitForActiveRequests(instanceId);
  
     
        await this.asgClient.send(new DetachInstancesCommand({
          AutoScalingGroupName: this.asgName,
          InstanceIds: [instanceId],
          ShouldDecrementDesiredCapacity: true
        }));
  
     
        await this.ec2Client.send(new TerminateInstancesCommand({
          InstanceIds: [instanceId]
        }));
  
       
        await prismaClient.workerInstance.delete({
          where: { instanceId }
        });
  
        logger.info(`Instance ${instanceId} drained successfully`);
      } catch (error) {
        logger.error(`Failed to drain instance ${instanceId}`, { error });
        throw error;
      }
    }
  
    private async waitForActiveRequests(instanceId: string, timeout = 300000): Promise<void> {
      const startTime = Date.now();
      
      while (Date.now() - startTime < timeout) {
        const activeRequests = await prismaClient.workerRequest.count({
          where: { 
            instanceId,
            completedAt: null 
          }
        });
  
        if (activeRequests === 0) return;
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
  
      throw new Error(`Drain timeout exceeded for instance ${instanceId}`);
    }
  
    public async handleLifecycleEvent(event: any): Promise<void> {
      const instanceId = event.detail.EC2InstanceId;
      try {
        await this.drainInstance(instanceId);
        await this.asgClient.send(new CompleteLifecycleActionCommand({
          AutoScalingGroupName: event.detail.AutoScalingGroupName,
          LifecycleActionResult: 'CONTINUE',
          LifecycleActionToken: event.detail.LifecycleActionToken,
          LifecycleHookName: event.detail.LifecycleHookName
        }));
      } catch (error) {
        logger.error(`Lifecycle event handling failed for ${instanceId}`, { error });
      }
    }
  
    public async initializeCluster(): Promise<void> {
      try {
        await this.optimizeCluster();
        logger.info('ASG cluster initialized');
      } catch (error) {
        logger.error('Cluster initialization failed', { error });
        throw error;
      }
    }
  }