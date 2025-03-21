process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import express from 'express';
import { KubeConfig, CoreV1Api } from "@kubernetes/client-node";
import * as k8s from "@kubernetes/client-node";
import cors from 'cors';
import { Writable } from 'stream';
import { DOMAIN } from './config';
import { prismaClient } from "db/client";

const kc = new KubeConfig();
const app = express();

const PROJECT_TYPE_TO_BASE_FOLDER = {
    NEXTJS: "/tmp/next-app",
    REACT: "/tmp/react-app",
    REACT_NATIVE: "/tmp/mobile-app"
}

const POD_EXPIRY = 1000 * 60 * 5; // 5 minutes
const EMPTY_POD_BUFFER_SIZE = 3;
kc.loadFromDefault();

app.use(cors());

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
const currentContext = kc.getCurrentContext();
const cluster = kc.getCluster(currentContext);

async function listPods(): Promise<string[]> {
    const res = await k8sApi.listNamespacedPod({ namespace: 'user-apps' });
    console.log(res.items.map((pod) => pod.status?.phase));
    return res.items.filter(pod => pod.status?.phase === 'Running' || pod.status?.phase === 'Pending').filter(pod => pod.metadata?.name).map((pod) => pod.metadata?.name as string);
}

async function createPod(name: string) {

    await k8sApi.createNamespacedPod({ namespace: 'user-apps', body: {
        metadata: {
            name: name,
            labels: {
                app: name,
            },
        },
        spec: {
            containers: [{
                name: "code-server",
                image: '100xdevs/code-server-base:v3',
                ports: [{ containerPort: 8080 }, { containerPort: 8081 }],
            }, {
                name: "ws-relayer",
                image: "100xdevs/antidevs-ws-relayer:ff488d08f7a2bf15c77d9787352a79468c14fc3f",
                ports: [{ containerPort: 9093 }],
            }, {
                name: "worker",
                image: "100xdevs/antidevs-worker:ff488d08f7a2bf15c77d9787352a79468c14fc3f",
                ports: [{ containerPort: 9091 }],
                env: [{
                    name: "WS_RELAYER_URL",
                    value: `ws://localhost:9091`,
                }, {
                    name: "ANTHROPIC_API_KEY",
                    valueFrom: {
                        secretKeyRef: {
                            name: "worker-secret",
                            key: "ANTHROPIC_API_KEY",
                        }
                    }
                }]
            }],
        },
    }});

    await k8sApi.createNamespacedService({ namespace: 'user-apps', body: {
        metadata: {
            name: `session-${name}`,
        },
        spec: {
            selector: {
                app: name,
            },
            ports: [{ port: 8080, targetPort: 8080, protocol: 'TCP', name: 'session' }],
        },
    }});

    await k8sApi.createNamespacedService({ namespace: 'user-apps', body: {
        metadata: {
            name: `preview-${name}`,
        },
        spec: {
            selector: {
                app: name,
            },
            ports: [{ port: 8080, targetPort: 8081, protocol: 'TCP', name: 'preview' }],
        },
    }});

    await k8sApi.createNamespacedService({ namespace: 'user-apps', body: {
        metadata: {
            name: `worker-${name}`,
        },
        spec: {
            selector: {
                app: name,
            },
            ports: [{ port: 8080, targetPort: 9091, protocol: 'TCP', name: 'preview' }],
        },
    }});
}

async function checkPodIsReady(name: string) {
    let attempts = 0;
    while (true) {
        const pod = await k8sApi.readNamespacedPod({ namespace: 'user-apps', name });
        if (pod.status?.phase === 'Running') {
            return;
        }
        if (attempts > 10) {
            throw new Error("Pod is not ready");
        }
        //TODO: Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, 2000));
        attempts++;
    }
}

async function assignPodToProject(projectId: string, projectType: "NEXTJS" | "REACT_NATIVE" | "REACT") {
    const pods = await listPods();
    const podExists = pods.find(pod => pod === projectId);
    if (!podExists) {
        console.log("Pod does not exist, creating pod");
        await createPod(projectId);
    }

    console.log("Pod exists, checking if it is ready");
    await checkPodIsReady(projectId);
    console.log("Pod is ready, moving project to pod");

    const exec = new k8s.Exec(kc);
    let stdout = "";
    let stderr = "";
    console.log(`mv ${PROJECT_TYPE_TO_BASE_FOLDER[projectType]}/* /app`);

    exec.exec("user-apps", projectId, "code-server", ["/bin/sh", "-c", `mv ${PROJECT_TYPE_TO_BASE_FOLDER[projectType]}/* /app`], 
        new Writable({
            write: (chunk: Buffer, encoding: BufferEncoding, callback: () => void) => {
                stdout += chunk;
                callback();
            }
        }), 
        new Writable({
            write: (chunk: Buffer, encoding: BufferEncoding, callback: () => void) => {
                stderr += chunk;
                callback();
            }
        }), 
        null,
        false, 
        (status) => {
            console.log(status);
            console.log(stdout);
            console.log(stderr);
        }
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(stdout);
    console.log(stderr);

    console.log(`Assigned project ${projectId} to pod ${projectId}`);
}

app.get("/worker/:projectId", async (req, res) => {
    console.log("Received request to assign project to pod for project", req.params.projectId);
    const { projectId } = req.params;
    const project = await prismaClient.project.findUnique({
        where: {
            id: projectId,
        },
    });

    if (!project) {
        res.status(404).json({ error: "Project not found" });
        return;
    }

    console.log("Project found, assigning to pod");
    await assignPodToProject(projectId, "REACT"); // project.type);
    console.log("Pod assigned, sending response");

    res.json({ 
        sessionUrl: `https://session-${projectId}.${DOMAIN}`, 
        previewUrl: `https://preview-${projectId}.${DOMAIN}`, 
        workerUrl: `https://worker-${projectId}.${DOMAIN}` 
    });
});

app.listen(7001, () => {
    console.log("Server is running on port 7001");
});
