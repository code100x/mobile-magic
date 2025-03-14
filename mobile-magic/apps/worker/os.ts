import { prismaClient } from "db/client";
import { RelayWebsocket } from "./ws";
import { exec } from "child_process";

const DOCKER_CONTAINER_NAME_RUNNING_CODE_SERVER = "my-code-server";

export function getBaseWorkerDir(type: "NEXTJS" | "REACT_NATIVE" | "REACT") {
    if (type === "NEXTJS") {
        return "/tmp/next-app";
    } else if(type === "REACT")
        return "/tmp/react-app"
    else
        return "/tmp/mobile-app";
}


export async function onFileUpdate(filePath: string, fileContent: string, projectId: string, promptId: string, type: "NEXTJS" | "REACT_NATIVE" | "REACT") {
    await prismaClient.action.create({
        data: {
            projectId,
            promptId,
            content: `Updated file ${filePath}`
        },
    });

    RelayWebsocket.getInstance().send(JSON.stringify({
        event: "admin",
        data: {
            type: "update-file",
            content: fileContent,
            path: `${getBaseWorkerDir(type)}/${filePath}`
        }
    }))
}

export async function onShellCommand(shellCommand: string, projectId: string, promptId: string) {
    //npm run build && npm run start
    const commands = shellCommand.split("&&");
    for (const command of commands) {
        console.log(`Running command: ${command}`);

        RelayWebsocket.getInstance().send(JSON.stringify({
            event: "admin",
            data: {
                type: "command",
                content: command
            }
        }))

        await prismaClient.action.create({
            data: {
                projectId,
                promptId,
                content: `Ran command: ${command}`,
            },
        });
    }
}


export function onPromptEnd(promptId: string) {
    RelayWebsocket.getInstance().send(JSON.stringify({
        event: "admin",
        data: {
            type: "prompt-end"
        }
    }))
}

export function pushToGitHubFromDockerContainer(repoUrl: string, accessToken: string, projectPath: string, commitMessage: string, isInitialCommit: boolean): Promise<boolean> {
    const containerName = DOCKER_CONTAINER_NAME_RUNNING_CODE_SERVER;
    const gitCommands = `
        cd ${projectPath} && \
        ${isInitialCommit && `git init && \
            git remote add origin ${getRemoteOrigin(repoUrl, accessToken)} && \
            git branch -M main && \ `}
        git config user.email "mobile-magic@github.com" && \
        git config user.name "Mobile Magic" && \
        git add . && \
        git commit -m "${commitMessage}" && \
        git push -u origin main
    `;
    return new Promise((resolve) => {
        exec(`docker exec ${containerName} sh -c '${gitCommands}'`, (err, stdout, stderr) => {
        if (err) {
            console.log("Error:", err.message);
            resolve(false);
        } else {
            console.log("Git push output: ", stdout);
            console.log("Stderr: ", stderr);
            resolve(true);
        }
        });
    });
};

function getRemoteOrigin(repoUrl: string, accessToken: string): string {
    const userNameRepoName = repoUrl.split("/").slice(-2).join("/");
    return `https://${accessToken}@github.com/${userNameRepoName}.git`;
}