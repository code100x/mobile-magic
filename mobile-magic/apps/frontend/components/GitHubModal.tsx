import React, { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { GitHubIcon } from "./GitHubIcon";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export const GitHubModal: React.FC<{
  projectId: string;
  workerUrl: string;
}> = ({ projectId, workerUrl }) => {
  const { getToken } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isRepoCreated, setIsRepoCreated] = useState(false);
  const [repoUrl, setRepoUrl] = useState<string | null>(null);
  const [gitHubUsername, setGitHubUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [cloneUrl, setCloneUrl] = useState<string | null>(null);
  const branch = "main";

  useEffect(() => {
    (async () => {
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        setIsLoading(true);
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/github/token`,
            {
              code,
              redirectUri: `${window.location.origin}/project/${projectId}`,
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${await getToken()}`,
              },
            }
          );

          if (response.status != 200) {
            console.log("Error exchanging code to access token");
            return;
          }
          setGitHubUsername(response.data.username);
          router.push(`/project/${projectId}`);
        } catch (err) {
          console.log("GitHub OAuth error:", err);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(true);
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/github/repoUrl?projectId=${projectId}`,
            {
              headers: {
                Authorization: `Bearer ${await getToken()}`,
              },
            }
          );
          if (response.status == 200) {
            setRepoUrl(response.data.repoUrl);
            setCloneUrl(getCloneUrl(response.data.repoUrl, "HTTPS"));
          }
        } catch (error) {
          console.log(error);
        } finally {
          setIsLoading(false);
        }
      }
    })();
  }, []);

  useEffect(() => {
    setIsRepoCreated(!!repoUrl);
    setIsConnected(!!gitHubUsername);
  }, [repoUrl, gitHubUsername]);

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleOnConnect() {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/github/username`,
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );
      if (response.status == 200) {
        if (response.data.isConnected)
          setGitHubUsername(response.data.gitHubUsername);
        else {
          const redirectUri = encodeURIComponent(
            `${window.location.origin}/project/${projectId}`
          );
          const authUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=repo`;
          window.location.href = authUrl;
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateRepo() {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/github/createRepo`,
        {
          projectId,
          workerUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );
      if (response.status == 200) {
        setRepoUrl(`${response.data.repoUrl}`);
        setCloneUrl(getCloneUrl(response.data.repoUrl, "HTTPS"));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="cursor-pointer font-semibold">
          <GitHubIcon />
          GitHub
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] bg-black text-white border-gray-800 p-4">
        {isLoading ? (
          <LoadingSpinner />
        ) : isRepoCreated ? (
          <div className="space-y-3">
            <div className="font-extrabold text-xl">GitHub</div>
            <div>
              <p className="text-gray-300">This project is connected to</p>
              <p className="font-semibold text-white">
                {repoUrl?.split("/").slice(-2).join("/") || ""}.
              </p>
              <p className="text-gray-300 text-sm">
                Mobile Magic will commit changes to the{" "}
                <span className="text-white">{branch}</span> branch.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold">Clone</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="text-xs py-1 px-2 h-auto bg-transparent text-white font-bold border-gray-700 hover:bg-gray-800 cursor-pointer"
                  onClick={() =>
                    setCloneUrl(getCloneUrl(repoUrl || "", "HTTPS"))
                  }
                >
                  HTTPS
                </Button>
                <Button
                  variant="outline"
                  className="text-xs py-1 px-2 h-auto bg-transparent text-white font-bold border-gray-700 hover:bg-gray-800 cursor-pointer"
                  onClick={() => setCloneUrl(getCloneUrl(repoUrl || "", "SSH"))}
                >
                  SSH
                </Button>
                <Button
                  variant="outline"
                  className="text-xs py-1 px-2 h-auto bg-transparent text-white font-bold border-gray-700 hover:bg-gray-800 cursor-pointer"
                  onClick={() => setCloneUrl(getCloneUrl(repoUrl || "", "CLI"))}
                >
                  CLI
                </Button>
              </div>

              <div className="flex mt-2">
                <div className="flex-1 bg-transparent border border-gray-700 rounded-l-md p-2 text-white font-semibold text-xs overflow-x-auto whitespace-nowrap">
                  {cloneUrl}
                </div>
                <div className="relative">
                  <Button
                    variant="outline"
                    className="bg-transparent border border-l-0 border-gray-700 rounded-l-none p-1 h-full cursor-pointer"
                    onClick={() => copyToClipboard(cloneUrl || "")}
                  >
                    <Copy className="h-4 w-4 text-blue-400" />
                  </Button>
                  {copied && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-white bg-gray-700 px-2 py-1 rounded shadow-md z-10">
                      Copied
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                asChild
                variant="outline"
                className="w-full bg-transparent border-gray-700 hover:bg-blue-700 text-white text-sm p-2 h-auto font-bold"
              >
                <a
                  href={repoUrl?.replace(".com", ".dev") || ""}
                  target="_blank"
                >
                  Edit in VS Code <ExternalLink className="h-3 w-3 ml-2" />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full bg-transparent border-gray-700 hover:bg-blue-700 text-white text-sm p-2 h-auto font-bold"
              >
                <a href={repoUrl || ""} target="_blank">
                  View on GitHub <ExternalLink className="h-3 w-3 ml-2" />
                </a>
              </Button>
            </div>
          </div>
        ) : isConnected ? (
          <div className="space-y-4">
            <div className="font-extrabold text-xl">GitHub</div>
            <p className="text-gray-300 text-sm">
              Connect your project to GitHub to save your code and collaborate
              with others.
            </p>
            <div className="font-bold">Create in</div>
            <Button
              className="w-full cursor-pointer font-extrabold"
              onClick={handleCreateRepo}
            >
              {gitHubUsername}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="font-extrabold text-xl">GitHub</div>
            <p className="text-gray-300 text-sm">
              Connect your project to GitHub to save your code and collaborate
              with others.
            </p>
            <Button
              className="cursor-pointer font-extrabold"
              onClick={handleOnConnect}
            >
              <GitHubIcon />
              Connect GitHub
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-10">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-500"></div>
    </div>
  );
}

function getCloneUrl(repoUrl: string, type: "HTTPS" | "SSH" | "CLI"): string {
  const usernameRepoName = repoUrl.split("/").slice(-2).join("/");
  if (type == "HTTPS") return `${repoUrl}.git`;
  else if (type == "SSH") return `git@github.com:${usernameRepoName}.git`;
  else return `gh repo clone ${usernameRepoName}`;
}
// bg-blue-600 hover:bg-blue-700
