/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Session` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Session_sessionToken_key";

-- CreateIndex
CREATE UNIQUE INDEX "Session_userId_key" ON "Session"("userId");
