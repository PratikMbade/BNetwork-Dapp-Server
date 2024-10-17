-- AlterTable
ALTER TABLE "bnCoinEarned" ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "bnCoinEarned_wallet_address_idx" ON "bnCoinEarned"("wallet_address");
