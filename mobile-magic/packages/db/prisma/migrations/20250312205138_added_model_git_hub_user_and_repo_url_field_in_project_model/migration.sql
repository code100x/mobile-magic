-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "repoUrl" TEXT;

-- CreateTable
CREATE TABLE "GitHubUser" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "username" TEXT NOT NULL,

    CONSTRAINT "GitHubUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GitHubUser_userId_key" ON "GitHubUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubUser_accessToken_key" ON "GitHubUser"("accessToken");
