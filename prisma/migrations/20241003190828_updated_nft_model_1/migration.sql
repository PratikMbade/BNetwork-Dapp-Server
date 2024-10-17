/*
  Warnings:

  - A unique constraint covering the columns `[userId,tokenType]` on the table `UserNFTs` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `tokenType` on the `NFTBonusHistory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `tokenType` on the `NFTTransferHistory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `royaltNFTId` to the `UserNFTs` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `tokenType` on the `UserNFTs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `tokenId` on table `UserNFTs` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "NFTBonusHistory" DROP COLUMN "tokenType",
ADD COLUMN     "tokenType" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "NFTTransferHistory" DROP COLUMN "tokenType",
ADD COLUMN     "tokenType" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "UserNFTs" ADD COLUMN     "royaltNFTId" TEXT NOT NULL,
DROP COLUMN "tokenType",
ADD COLUMN     "tokenType" INTEGER NOT NULL,
ALTER COLUMN "tokenId" SET NOT NULL;

-- CreateTable
CREATE TABLE "RoyaltyNFTs" (
    "id" TEXT NOT NULL,
    "tokenType" INTEGER NOT NULL,
    "tokenId" INTEGER NOT NULL,
    "tokenCount" INTEGER NOT NULL,

    CONSTRAINT "RoyaltyNFTs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserNFTs_userId_tokenType_key" ON "UserNFTs"("userId", "tokenType");

-- AddForeignKey
ALTER TABLE "UserNFTs" ADD CONSTRAINT "UserNFTs_royaltNFTId_fkey" FOREIGN KEY ("royaltNFTId") REFERENCES "RoyaltyNFTs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
