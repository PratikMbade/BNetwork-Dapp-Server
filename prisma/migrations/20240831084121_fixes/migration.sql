/*
  Warnings:

  - The primary key for the `BNCoinConfig` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `CosmosPlanet` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Planet` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `bnCoinEarned` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Ancestors" DROP CONSTRAINT "Ancestors_userId_fkey";

-- DropForeignKey
ALTER TABLE "CosmosPlanet" DROP CONSTRAINT "CosmosPlanet_planetId_fkey";

-- DropForeignKey
ALTER TABLE "CosmosPlanet" DROP CONSTRAINT "CosmosPlanet_userId_fkey";

-- DropForeignKey
ALTER TABLE "DirectTeam" DROP CONSTRAINT "DirectTeam_userId_fkey";

-- DropForeignKey
ALTER TABLE "EarningInfo" DROP CONSTRAINT "EarningInfo_userId_fkey";

-- DropForeignKey
ALTER TABLE "_IndexMappingUserIds" DROP CONSTRAINT "_IndexMappingUserIds_B_fkey";

-- DropForeignKey
ALTER TABLE "bnCoinEarned" DROP CONSTRAINT "bnCoinEarned_userId_fkey";

-- AlterTable
ALTER TABLE "Ancestors" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "BNCoinConfig" DROP CONSTRAINT "BNCoinConfig_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "BNCoinConfig_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "BNCoinConfig_id_seq";

-- AlterTable
ALTER TABLE "CosmosPlanet" DROP CONSTRAINT "CosmosPlanet_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "planetId" SET DATA TYPE TEXT,
ADD CONSTRAINT "CosmosPlanet_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CosmosPlanet_id_seq";

-- AlterTable
ALTER TABLE "DirectTeam" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "EarningInfo" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Planet" DROP CONSTRAINT "Planet_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Planet_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Planet_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ADD COLUMN     "isRegistered" BOOLEAN DEFAULT false,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AlterTable
ALTER TABLE "_IndexMappingUserIds" ALTER COLUMN "B" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "bnCoinEarned" DROP CONSTRAINT "bnCoinEarned_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "bnCoinEarned_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "bnCoinEarned_id_seq";

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CryptoLoginNonce" (
    "userId" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "CryptoLoginNonce_userId_key" ON "CryptoLoginNonce"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CryptoLoginNonce" ADD CONSTRAINT "CryptoLoginNonce_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CosmosPlanet" ADD CONSTRAINT "CosmosPlanet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CosmosPlanet" ADD CONSTRAINT "CosmosPlanet_planetId_fkey" FOREIGN KEY ("planetId") REFERENCES "Planet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectTeam" ADD CONSTRAINT "DirectTeam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ancestors" ADD CONSTRAINT "Ancestors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bnCoinEarned" ADD CONSTRAINT "bnCoinEarned_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EarningInfo" ADD CONSTRAINT "EarningInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IndexMappingUserIds" ADD CONSTRAINT "_IndexMappingUserIds_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
