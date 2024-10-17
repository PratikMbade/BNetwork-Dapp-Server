-- CreateTable
CREATE TABLE "NFTBonusHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenId" INTEGER NOT NULL,
    "tokenType" TEXT NOT NULL,
    "bonusAmount" DOUBLE PRECISION NOT NULL,
    "claminedDate" TIMESTAMP(3) NOT NULL,
    "bonusLaunchDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NFTBonusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserNFTs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenType" TEXT NOT NULL,
    "tokenId" INTEGER,
    "mintDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserNFTs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NFTTransferHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenType" TEXT NOT NULL,
    "tokenId" INTEGER NOT NULL,
    "receiver_wallet_address" TEXT NOT NULL,

    CONSTRAINT "NFTTransferHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NFTBonusHistory" ADD CONSTRAINT "NFTBonusHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNFTs" ADD CONSTRAINT "UserNFTs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NFTTransferHistory" ADD CONSTRAINT "NFTTransferHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
