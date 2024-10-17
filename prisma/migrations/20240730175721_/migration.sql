/*
  Warnings:

  - You are about to drop the column `wallet_addresss` on the `bnCoinEarned` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[wallet_address]` on the table `bnCoinEarned` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `wallet_address` to the `bnCoinEarned` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "bnCoinEarned_wallet_addresss_key";

-- AlterTable
ALTER TABLE "bnCoinEarned" DROP COLUMN "wallet_addresss",
ADD COLUMN     "wallet_address" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "bnCoinEarned_wallet_address_key" ON "bnCoinEarned"("wallet_address");
