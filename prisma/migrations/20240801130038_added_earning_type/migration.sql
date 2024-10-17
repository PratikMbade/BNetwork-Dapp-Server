-- CreateEnum
CREATE TYPE "EarningType" AS ENUM ('DIRECT_EARNING', 'LEVEL_EARNING', 'UPGRADE_EARNING', 'AUTOPOOL_EARNING');

-- CreateTable
CREATE TABLE "EarningInfo" (
    "id" SERIAL NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "senderAddress" TEXT NOT NULL,
    "planetName" TEXT NOT NULL,
    "earningType" "EarningType" NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "EarningInfo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EarningInfo" ADD CONSTRAINT "EarningInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
