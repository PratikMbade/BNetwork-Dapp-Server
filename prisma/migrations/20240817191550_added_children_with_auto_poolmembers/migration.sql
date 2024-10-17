/*
  Warnings:

  - Added the required column `childrenId` to the `AutoPool` table without a default value. This is not possible if the table is not empty.
  - Added the required column `planetName` to the `Children` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AutoPool" ADD COLUMN     "childrenId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Children" ADD COLUMN     "planetName" TEXT NOT NULL;
