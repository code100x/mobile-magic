import cors from "cors";
import express from "express";
import { prismaClient } from "db/client";
import Anthropic from '@anthropic-ai/sdk';
import { systemPrompt } from "./systemPrompt";
import { ArtifactProcessor } from "./parser";
import { onFileUpdate, onShellCommand } from "./os";
import { createASGOrchestrator } from "orchestrator/client";
import fetch from 'node-fetch'; // Add node-fetch for AWS metadata



const app = express();
app.use(cors());
app.use(express.json());

// Create an orchestrator instance
const orchestrator = createASGOrchestrator(process.env.ASG_Name, 1, 5);
// Track worker processing state

let isProcessing = false;

async function getInstanceId(): Promise<string> {
  try {
    const response = await fetch('latest/meta-data/instance-id'); // add instance-id metadata
    return await response.text();
  } catch (error) {
    console.error('Error fetching instance ID:', error);
    return 'unknown-instance';
  }
}

app.post("/prompt", async (req, res) => {
  const { prompt, projectId } = req.body;
  const client = new Anthropic();
  const instanceId = await getInstanceId();

  // Mark worker as active when processing starts
  isProcessing = true;
  await orchestrator.markWorkerActive(instanceId);

  await prismaClient.prompt.create({
    data: {
      content: prompt,
      projectId,
      type: "USER",
    },
  });

  const allPrompts = await prismaClient.prompt.findMany({
    where: {
      projectId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  let artifactProcessor = new ArtifactProcessor("", 
    (filePath, fileContent) => onFileUpdate(filePath, fileContent, projectId), 
    (shellCommand) => onShellCommand(shellCommand, projectId)
  );
  let artifact = "";

  let response = client.messages.stream({
    messages: allPrompts.map((p: any) => ({
      role: p.type === "USER" ? "user" : "assistant",
      content: p.content,
    })),
    system: systemPrompt,
    model: "claude-3-7-sonnet-20250219",
    max_tokens: 8000,
  }).on('text', (text) => {
    artifactProcessor.append(text);
    artifactProcessor.parse();
    artifact += text;
  })
  .on('finalMessage', async () => {
    console.log("done!");
    await prismaClient.prompt.create({
      data: {
        content: artifact,
        projectId,
        type: "SYSTEM",
      },
    });

    await prismaClient.action.create({
      data: {
        content: "Done!",
        projectId,
      },
    });

    // Mark worker as idle when done
    isProcessing = false;
    await orchestrator.markWorkerIdle(instanceId);
  })
  .on('error', (error) => {
    console.log("error", error);
    // Mark worker as idle on error
    isProcessing = false;
    orchestrator.markWorkerIdle(instanceId); // No await here since it's fire-and-forget
  });

  res.json({ response });
});

app.listen(9091, () => {
  console.log("Server is running on port 9091");
});

// Periodic scaling check
setInterval(async () => {
  const instanceId = await getInstanceId();
  const instances = await orchestrator.getRunningInstances();
  if (!isProcessing && instances.length < 5) {
    await orchestrator.scaleUp();
  }
}, 60000); // Check every minute