/*
  Warnings:

  - A unique constraint covering the columns `[userId,wallet_address]` on the table `Ancestors` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Ancestors_userId_wallet_address_key" ON "Ancestors"("userId", "wallet_address");
