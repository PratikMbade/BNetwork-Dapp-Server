/*
  Warnings:

  - Made the column `ancestorsNumber` on table `Ancestors` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Ancestors" ALTER COLUMN "ancestorsNumber" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "levelEarning" DOUBLE PRECISION DEFAULT 0.0;
