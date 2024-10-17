/*
  Warnings:

  - You are about to drop the column `autoPoolId` on the `Children` table. All the data in the column will be lost.
  - Added the required column `parentId` to the `Children` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Children" DROP CONSTRAINT "Children_autoPoolId_fkey";

-- AlterTable
ALTER TABLE "Children" DROP COLUMN "autoPoolId",
ADD COLUMN     "parentId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Children" ADD CONSTRAINT "Children_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "AutoPool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
