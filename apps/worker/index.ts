// worker/index.ts
import cors from "cors";
import express from "express";
import type { Request, Response } from "express";
import { prismaClient } from "db/client";
import Anthropic from '@anthropic-ai/sdk';
import { systemPrompt } from "./systemPrompt";
import { ArtifactProcessor } from "./parser";
import { ASGService } from "./asg-service";
import { onFileUpdate, onShellCommand } from "./os";
import { logger, metrics } from './monitoring';
import { config } from 'dotenv';
import { errorHandler } from "./error-middleware";

config();

// Validate environment variables
const requiredEnvVars = ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'ASG_NAME', 'ANTHROPIC_API_KEY'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) throw new Error(`Missing required environment variable: ${varName}`);
});

// Initialize services
const asgService = new ASGService(process.env.ASG_NAME!);
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(errorHandler);

// Health endpoint
app.get('/health', async (req: Request, res: Response) => {
  try {
    const healthData = await asgService.checkClusterHealth();
    await metrics.putMetricData({
      MetricData: [{
        MetricName: 'HealthyInstances',
        Value: healthData.healthyInstances,
        Unit: 'Count'
      }],
      Namespace: 'Bolty/ASG'
    });
    
    res.json(healthData);
  } catch (error) {
    logger.error('Health check failed', { error });
    res.status(503).json({ status: 'unhealthy' });
  }
});

// Prompt processing endpoint
app.post("/prompt", async (req: Request, res: Response): Promise<void> => {
  const { prompt, projectId } = req.body;
  
  try {
    // Validate input
    if (!prompt?.trim() || !projectId?.trim()) {
      res.status(400).json({ error: "Invalid request parameters" });
      return;
    }

    // Start processing metrics
    await metrics.putMetricData({
      MetricData: [{
        MetricName: 'ActiveProcesses',
        Value: 1,
        Unit: 'Count'
      }],
      Namespace: 'Bolty/ASG'
    });

    // Database transaction
    await prismaClient.$transaction([
      prismaClient.prompt.create({
        data: { content: prompt, projectId, type: "USER" }
      }),
      prismaClient.action.create({
        data: { content: "Process started", projectId }
      })
    ]);

    // Get active instances and initialize processor
    const instances = await asgService.getActiveInstances();
    if (instances.length === 0) {
      throw new Error('No active instances available');
    }

    const processor = new ArtifactProcessor(
      instances,
      (fp: string, fc: string) => onFileUpdate(fp, fc, projectId),
      (cmd: string) => onShellCommand(cmd, projectId)
    );

    // Create AI client
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      timeout: 10000
    });

    // Get conversation history
    const messages = await prismaClient.prompt.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' }
    });

    // Stream setup
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Process stream with proper event handling
    const stream = client.messages.stream({
      messages: messages.map(msg => ({
        role: msg.type === "USER" ? "user" : "assistant" as const,
        content: msg.content
      })),
      system: systemPrompt,
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 8000,
    });

    try {
      for await (const event of stream) {
        if (event.type === 'content_block_delta') {
          const content = event.delta.text;
          processor.append(content);
          res.write(JSON.stringify({ content }));
        }
      }
    } finally {
      await stream.finalize();
    }

    // Finalize processing
    await processor.finalize();
    await asgService.optimizeCluster();
    res.end();

  } catch (error) {
    logger.error('Prompt processing failed', { error, projectId });
    await metrics.putMetricData({
      MetricData: [{
        MetricName: 'FailedProcesses',
        Value: 1,
        Unit: 'Count'
      }],
      Namespace: 'Bolty/ASG'
    });
    res.status(500).json({ error: "Processing failed" });
  }
});

// Server initialization
app.listen(9091, async () => {
  try {
    logger.info('Server starting on port 9091');
    await asgService.initializeCluster();
    logger.info('Cluster initialization complete');
  } catch (error) {
    logger.error('Server startup failed', { error });
    process.exit(1);
  }
});