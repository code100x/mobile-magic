import { prismaClient } from "db/client";

const BASE_WORKER_DIR = "/tmp/bolty-worker";

if (!Bun.file(BASE_WORKER_DIR).exists()) {
    Bun.write(BASE_WORKER_DIR, "");
}

export async function onFileUpdate(filePath: string, fileContent: string, projectId: string) {
    await Bun.write(`${BASE_WORKER_DIR}/${filePath}`, fileContent);
    await prismaClient.action.create({
        data: {
            projectId,
            content: `Updated file ${filePath}`
        },
    });
}

export async function onShellCommand(shellCommand: string, projectId: string) {
    const commands = shellCommand.split("&&");
    for (const command of commands) {
      console.log(`Running command: ${command}`);
      const result = Bun.spawnSync({ cmd: command.split(" "), cwd: BASE_WORKER_DIR });
      await prismaClient.action.create({
        data: {
          projectId,
          content: `Ran command: ${command}`,
        },
      });
    }
  }