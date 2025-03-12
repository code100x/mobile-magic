import { prismaClient } from "db/client";
import express from "express";
import cors from "cors";
import { authMiddleware } from "common/middleware";
import axios from 'axios';

const app = express();
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:9090";

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

app.post("/createrepo", async (req, res) => {
  const { githubToken, githubUsername, files } = req.body;

  if (!githubToken || !githubUsername) {
    res.status(400).json({ error: "Missing parameters: githubToken and githubUsername are required." });
    return;
  }

  if (!files || !Array.isArray(files) || files.length === 0) {
    res.status(400).json({ error: "Missing or empty 'files' array." });
    return;
  }

  try {
    const newRepoName = `from-magic-mobile-${Date.now()}`;

    const createRepoRes = await axios.post(
      "https://api.github.com/user/repos",
      { name: newRepoName, private: false },
      { headers: { Authorization: `Bearer ${githubToken}` } }
    );

    const newRepoUrl = createRepoRes.data.html_url;

    for (const file of files) {
      if (file && file.name && file.content) {
        const encodedContent = Buffer.from(file.content).toString("base64");
        console.log(`Uploading ${file.name} from system to ${newRepoName}`);

        await axios.put(
          `https://api.github.com/repos/${githubUsername}/${newRepoName}/contents/${file.name}`,
          {
            message: `Added ${file.name} from system`,
            content: encodedContent,
            branch: "main",
          },
          { headers: { Authorization: `Bearer ${githubToken}` } }
        );
      } else {
        console.warn("Invalid file object in 'files' array.");
      }
    }

    res.status(200).json({ message: "Repository created successfully!", repoUrl: newRepoUrl });
  } catch (error) {
    console.error("Error creating repository:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to create repository" });
  }
});

app.get("/auth/github", (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${BACKEND_URL}/auth/github/callback&scope=repo,user`;
  res.redirect(githubAuthUrl);
});

app.get("/auth/github/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) res.status(400).send("GitHub OAuth failed!");

  try {

    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    const accessToken = tokenRes.data.access_token;

    const userRes = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const { login, id } = userRes.data;

    res.redirect(`http://localhost:3000?githubToken=${accessToken}&githubId=${id}&githubUsername=${login}`); // Redirect to frontend after linking GitHub
  } catch (error) {
    console.error("GitHub OAuth Error:", error);
    res.status(500).send("GitHub authentication failed");
  }
});

app.listen(9090, () => {
  console.log("Server is running on port 9090");
});
