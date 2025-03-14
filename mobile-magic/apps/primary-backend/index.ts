import { prismaClient } from "db/client";
import express from "express";
import cors from "cors";
import { authMiddleware } from "common/middleware";
import axios from "axios";

const app = express();

app.use(express.json());
app.use(cors());

app.post("/project", authMiddleware, async (req, res) => {
  const { prompt, type } = req.body;
  const userId = req.userId!;
  //TODO: add logic to get a useful name for the project from the prompt
  const description = prompt.split("\n")[0];
  const project = await prismaClient.project.create({
    data: { description, userId, type },
  });
  res.json({ projectId: project.id });
});

app.get("/projects", authMiddleware, async (req, res) => {
  const userId = req.userId!;
  const projects = await prismaClient.project.findMany({
    where: { userId },
  });
  res.json({ projects });
});

app.get("/prompts/:projectId", authMiddleware, async (req, res) => {
  const userId = req.userId!;
  const projectId = req.params.projectId;

  const prompts = await prismaClient.prompt.findMany({
    where: { projectId },
    include: {
      actions: true,
    },
  });
  res.json({ prompts });
});

app.get("/github/repoUrl", authMiddleware, async (req, res) => {
  const { projectId } = req.query;
  const userId = req.userId!;
  if (!projectId) {
    res.status(400).json({ error: "ProjectId does not exist" });
    return;
  }
  const project = await prismaClient.project.findFirst({
    where: {
      id: projectId as string,
      userId,
    },
  });
  if (!project) {
    res.status(400).json({ error: "Project does not exist" });
    return;
  }
  res.json({ repoUrl: project.repoUrl });
});

app.get("/github/username", authMiddleware, async (req, res) => {
  const userId = req.userId!;
  const gitHub = await prismaClient.gitHubUser.findFirst({
    where: {
      userId,
    },
  });
  if (!gitHub) res.json({ isConnected: false, gitHubUsername: null });
  else res.json({ isConnected: true, gitHubUsername: gitHub.username });
});

app.post("/github/token", authMiddleware, async (req, res) => {
  const { code, redirectUri } = req.body;
  const userId = req.userId!;
  try {
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      },
      {
        headers: { Accept: "application/json" },
      }
    );
    if (tokenRes.status != 200) {
      console.log("OAuth error");
      res.status(500).send("GitHub OAuth failed.");
      return;
    }
    const accessToken = tokenRes.data.access_token;
    const userRes = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (userRes.status != 200) {
      console.log("Error fetching user details");
      res.status(500).send("Error fetching user details");
      return;
    }
    const username = userRes.data.login;
    await prismaClient.gitHubUser.create({
      data: {
        userId,
        accessToken,
        username,
      },
    });
    res.json({ username });
  } catch (err) {
    console.log("OAuth error:", err);
    res.status(500).send("GitHub OAuth failed.");
  }
});

app.post("/github/createRepo", authMiddleware, async (req, res) => {
  const { projectId, workerUrl } = req.body;
  const userId = req.userId!;
  const github = await prismaClient.gitHubUser.findFirst({
    where: { userId }
  });
  if(!github) {
    res.status(400).send("Access Token does not exist");
    return;
  }
  try {
    const response = await axios.post(`${workerUrl}/github/createRepo`, {
      projectId
    });
    if(response.status != 200) {
      res.status(500).send("Error while creating a new repo (or) while pushing the code to GitHub");
      return;
    }
    res.json(response.data);
  } catch (error) {
    res.status(500).send("Error while creating a new repo (or) while pushing the code to GitHub");
    return;
  }
});

app.listen(9090, () => {
  console.log("Server is running on port 9090");
});