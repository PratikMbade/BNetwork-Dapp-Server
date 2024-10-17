/*
  Warnings:

  - A unique constraint covering the columns `[tokenType]` on the table `RoyaltyNFTs` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RoyaltyNFTs_tokenType_key" ON "RoyaltyNFTs"("tokenType");
