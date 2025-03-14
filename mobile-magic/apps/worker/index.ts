import cors from "cors";
import express from "express";
import { prismaClient } from "db/client";
import Anthropic from '@anthropic-ai/sdk';
import { systemPrompt, systemPromptForRepoName } from "./systemPrompt";
import { ArtifactProcessor } from "./parser";
import { getBaseWorkerDir, onFileUpdate, onPromptEnd, onShellCommand, pushToGitHubFromDockerContainer } from "./os";
import { RelayWebsocket } from "./ws";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());
const client = new Anthropic();

app.post("/prompt", async (req, res) => {
  const { prompt, projectId } = req.body;
  const project = await prismaClient.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const promptDb = await prismaClient.prompt.create({
    data: {
      content: prompt,
      projectId,
      type: "USER",
    },
  });

  const { diff } = await RelayWebsocket.getInstance().sendAndAwaitResponse({
    event: "admin",
    data: {
      type: "prompt-start",
    }
  }, promptDb.id);

  if (diff) {
    await prismaClient.prompt.create({
      data: {
        content: `<bolt-user-diff>${diff}</bolt-user-diff>\n\n$`,
        projectId,
        type: "USER",
      },
    });
  }

  const allPrompts = await prismaClient.prompt.findMany({
    where: {
      projectId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  let artifactProcessor = new ArtifactProcessor("", (filePath, fileContent) => onFileUpdate(filePath, fileContent, projectId, promptDb.id, project.type), (shellCommand) => onShellCommand(shellCommand, projectId, promptDb.id));
  let artifact = "";

  let response = client.messages.stream({
    messages: allPrompts.map((p: any) => ({
      role: p.type === "USER" ? "user" : "assistant",
      content: p.content,
    })),
    system: systemPrompt(project.type),
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
        promptId: promptDb.id,
      },
    });
    onPromptEnd(promptDb.id);
  })
  .on('error', (error) => {
    console.log("error", error);
  });

  // Wait some time till all the files get updated and then push to GitHub
  await new Promise((r) => setTimeout(r, 1000 * 30));

  let isPushToGitHubSuccess: {
    isSuccess: boolean;
    message: string;
  };
  if(!project.repoUrl) {
    isPushToGitHubSuccess = {
      isSuccess: false,
      message: "Project is not connected to GitHub"
    };
  } else {
    const github = await prismaClient.gitHubUser.findFirst({
      where: {
        userId: project.userId
      }
    });
    if(!github)
      isPushToGitHubSuccess = {
        isSuccess: false,
        message: "Access Token does not exist"
      }
    else {
      try {
        const userRes = await axios.get("https://api.github.com/user", {
          headers: { Authorization: `Bearer ${github.accessToken}` },
        });
        if (userRes.status == 401 || userRes.status == 403) {
          console.log("Access token is not valid");
          isPushToGitHubSuccess = {
            isSuccess: false,
            message: "Access token is not valid"
          };
        } else {
          // For the 3rd parameter in the below function, we should give the complete path of this particular project directory (which is in code-server docker container). For now, given /tmp/project.type for the path.
          const isSuccess = await pushToGitHubFromDockerContainer(project.repoUrl, github.accessToken, getBaseWorkerDir(project.type), "Added changes", false);
          isPushToGitHubSuccess = {
            isSuccess,
            message: isSuccess ? "Successfully pushed to GitHub" : "Error while pushing to GitHub"
          }
        } 
      } catch (error) {
        console.log(error);
        isPushToGitHubSuccess = {
          isSuccess: false,
          message: "Error while checking if access token is valid or not"
        };
      }
    }
  }
  res.json({ response, isPushToGitHubSuccess });
});

app.post("/github/createRepo", async (req, res) => {
  const { projectId } = req.body;
  const project = await prismaClient.project.findFirst({
    where: {
      id: projectId
    }
  });
  if(!project) {
    res.status(400).json({ error: "Project does not exist" });
    return;
  }
  const github = await prismaClient.gitHubUser.findFirst({
    where: {
      userId: project.userId
    }
  });
  if(!github) {
    res.status(400).json({ error: "Access token does not exist" });
    return;
  }
  const initialPrompt = await prismaClient.prompt.findFirst({
    where: {
      projectId
    },
    orderBy: {
      createdAt: "asc"
    },
    take: 1
  });
  if(!initialPrompt) {
    res.status(400).json({ error: "Initial Prompt does not exist" });
    return;
  }
  const msg = await client.messages.create({
    model: "claude-3-7-sonnet-20250219",
    max_tokens: 1024,
    system: systemPromptForRepoName(),
    messages: [{ role: "user", content: initialPrompt.content }],
  });
  const repoName = msg.content[0].type == "text" && msg.content[0].text || ("repo-" + Math.random().toString());
  try {
    const response = await axios.post(
      "https://api.github.com/user/repos",
      { name: repoName, private: false },
      {
        headers: {
          Authorization: `Bearer ${github.accessToken}`,
          Accept: "application/vnd.github+json"
        }
      }
    );
    if(response.status != 201) {
      res.status(400).json({ error: "Error while creating a new repo" });
      return;
    }
    // For the 3rd parameter in the below function, we should give the complete path of this particular project directory (which is in code-server docker container). For now, given /tmp/project.type for the path.
    const isPushSuccess = await pushToGitHubFromDockerContainer(response.data.html_url, github.accessToken, getBaseWorkerDir(project.type), "Initial Commit", true);
    if(isPushSuccess) {
      await prismaClient.project.update({
        where: {
          id: projectId
        },
        data: {
          repoUrl: response.data.html_url
        }
      });
      res.json({ repoUrl: response.data.html_url });
    }
    else 
      res.status(500).json({ error: "Error pushing code to GitHub"  });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error while creating a new repo" });
    return;
  }
});

app.listen(9091, () => {
  console.log("Server is running on port 9091");
});
