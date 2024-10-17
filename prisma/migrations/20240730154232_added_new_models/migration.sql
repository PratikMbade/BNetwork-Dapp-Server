/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `CosmosPlanet` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "directTeam_Count" INTEGER,
ADD COLUMN     "lastestPlanetName" TEXT,
ADD COLUMN     "totalTeam_Count" INTEGER,
ALTER COLUMN "sponser_address" DROP DEFAULT;

-- CreateTable
CREATE TABLE "DirectTeam" (
    "id" SERIAL NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "DirectTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ancestors" (
    "id" SERIAL NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Ancestors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bnCoinEarned" (
    "id" SERIAL NOT NULL,
    "bn_id" TEXT NOT NULL,
    "wallet_addresss" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "timeStamp" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "bnCoinEarned_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BNCoinConfig" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "BNMaxRewardsCoins" INTEGER NOT NULL,
    "BNMaxAirDropCoins" INTEGER NOT NULL,

    CONSTRAINT "BNCoinConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DirectTeam_wallet_address_key" ON "DirectTeam"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "DirectTeam_userId_key" ON "DirectTeam"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Ancestors_wallet_address_key" ON "Ancestors"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "Ancestors_userId_key" ON "Ancestors"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "bnCoinEarned_wallet_addresss_key" ON "bnCoinEarned"("wallet_addresss");

-- CreateIndex
CREATE UNIQUE INDEX "BNCoinConfig_key_key" ON "BNCoinConfig"("key");

-- CreateIndex
CREATE UNIQUE INDEX "CosmosPlanet_userId_key" ON "CosmosPlanet"("userId");

-- AddForeignKey
ALTER TABLE "DirectTeam" ADD CONSTRAINT "DirectTeam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ancestors" ADD CONSTRAINT "Ancestors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bnCoinEarned" ADD CONSTRAINT "bnCoinEarned_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
