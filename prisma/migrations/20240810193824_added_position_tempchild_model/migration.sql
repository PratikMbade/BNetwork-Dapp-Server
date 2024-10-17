/*
  Warnings:

  - Added the required column `position` to the `TempChild` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TempChild" ADD COLUMN     "position" INTEGER NOT NULL;
