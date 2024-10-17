/*
  Warnings:

  - A unique constraint covering the columns `[bn_id,planetName]` on the table `AutoPool` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "AutoPool_bn_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "AutoPool_bn_id_planetName_key" ON "AutoPool"("bn_id", "planetName");
