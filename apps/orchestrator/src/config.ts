export const PORT = Number(process.env.PORT) || 3002;

export const AWS_REGION = process.env.AWS_REGION || "us-east-1";
export const AMI_ID = process.env.AMI_ID || "ami-09679623960667b27";
export const INSTANCE_TYPE = process.env.INSTANCE_TYPE || "t2.micro";
export const SECURITY_GROUP = process.env.SECURITY_GROUP || "sg-03541373d8c7e9f37";
export const KEY_NAME = process.env.KEY_NAME
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY

export const IDLE_WORKER_THRESHOLD = Number(process.env.IDLE_WORKER_THRESHOLD) || 1;

export const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL;

export const VSCODE_PASSWORD = process.env.VSCODE_PASSWORD;
export const WORKER_DIRECTORY = process.env.WORKER_DIRECTORY || "/tem/worker";

export const HTTP_PORT = Number(process.env.HTTP_PORT);
export const VSCODE_PORT = Number(process.env.VSCODE_PORT);
export const REACT_EXPO_PORT_1 = Number(process.env.REACT_EXPO_PORT);
