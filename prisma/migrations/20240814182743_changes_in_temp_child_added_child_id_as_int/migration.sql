/*
  Warnings:

  - Added the required column `childAddress` to the `TempChild` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `childId` on the `TempChild` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "TempChild" ADD COLUMN     "childAddress" TEXT NOT NULL,
DROP COLUMN "childId",
ADD COLUMN     "childId" INTEGER NOT NULL;
