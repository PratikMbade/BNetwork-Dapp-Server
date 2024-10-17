/*
  Warnings:

  - Added the required column `BNAirDropCoinDistributed` to the `BNCoinConfig` table without a default value. This is not possible if the table is not empty.
  - Added the required column `BNCoinDistributed` to the `BNCoinConfig` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BNCoinConfig" ADD COLUMN     "BNAirDropCoinDistributed" INTEGER NOT NULL,
ADD COLUMN     "BNCoinDistributed" INTEGER NOT NULL;
