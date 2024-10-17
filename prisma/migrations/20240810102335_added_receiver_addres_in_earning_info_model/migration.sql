/*
  Warnings:

  - Added the required column `receiverAddress` to the `EarningInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EarningInfo" ADD COLUMN     "receiverAddress" TEXT NOT NULL;
