/*
  Warnings:

  - A unique constraint covering the columns `[regId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "regId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "User_regId_key" ON "User"("regId");
