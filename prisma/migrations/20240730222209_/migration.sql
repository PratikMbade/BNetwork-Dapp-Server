/*
  Warnings:

  - A unique constraint covering the columns `[planetName]` on the table `CosmosPlanet` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CosmosPlanet_planetName_key" ON "CosmosPlanet"("planetName");
