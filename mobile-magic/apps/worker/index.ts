import cors from "cors";
import express from "express";
import { prismaClient } from "db/client";
import Anthropic from '@anthropic-ai/sdk';
import { systemPrompt } from "./systemPrompt";
import { ArtifactProcessor } from "./parser";
import { onFileUpdate, onPromptEnd, onPromptStart, onShellCommand } from "./os";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/prompt", async (req, res) => {
  const { prompt, projectId } = req.body;
  const client = new Anthropic();
  
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

  let artifactProcessor = new ArtifactProcessor("", (filePath, fileContent) => onFileUpdate(filePath, fileContent, projectId), (shellCommand) => onShellCommand(shellCommand, projectId));
  let artifact = "";

  onPromptStart()
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
  .on('finalMessage', async (message) => {
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
    onPromptEnd();
  })
  .on('error', (error) => {
    console.log("error", error);
  });

  res.json({ response });
});

app.listen(9091, () => {
  console.log("Server is running on port 9091");
});
