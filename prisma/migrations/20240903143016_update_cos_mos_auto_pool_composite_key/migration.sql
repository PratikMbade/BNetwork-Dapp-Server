/*
  Warnings:

  - Made the column `planetName` on table `AutoPool` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "AutoPool_reg_user_address_key";

-- AlterTable
ALTER TABLE "AutoPool" ALTER COLUMN "planetName" SET NOT NULL;
