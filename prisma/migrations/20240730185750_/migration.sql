/*
  Warnings:

  - A unique constraint covering the columns `[wallet_address,userId]` on the table `bnCoinEarned` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "bnCoinEarned_wallet_address_idx";

-- CreateIndex
CREATE UNIQUE INDEX "bnCoinEarned_wallet_address_userId_key" ON "bnCoinEarned"("wallet_address", "userId");
