-- CreateEnum
CREATE TYPE "InstanceStatus" AS ENUM ('ACTIVE', 'DRAINING', 'TERMINATED');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "WorkerInstance" (
    "id" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "status" "InstanceStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastActivity" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "region" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "WorkerInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerRequest" (
    "id" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "promptId" TEXT,

    CONSTRAINT "WorkerRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkerInstance_instanceId_key" ON "WorkerInstance"("instanceId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkerRequest_promptId_key" ON "WorkerRequest"("promptId");

-- AddForeignKey
ALTER TABLE "WorkerRequest" ADD CONSTRAINT "WorkerRequest_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "WorkerInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerRequest" ADD CONSTRAINT "WorkerRequest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerRequest" ADD CONSTRAINT "WorkerRequest_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
