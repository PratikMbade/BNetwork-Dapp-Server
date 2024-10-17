/*
  Warnings:

  - Added the required column `planetId` to the `CosmosPlanet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CosmosPlanet" ADD COLUMN     "planetId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Planet" (
    "id" SERIAL NOT NULL,
    "planetNum" INTEGER NOT NULL,
    "planetName" TEXT NOT NULL,
    "planetPrice" INTEGER NOT NULL,
    "universalCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Planet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Planet_planetNum_key" ON "Planet"("planetNum");

-- CreateIndex
CREATE UNIQUE INDEX "Planet_planetName_key" ON "Planet"("planetName");

-- AddForeignKey
ALTER TABLE "CosmosPlanet" ADD CONSTRAINT "CosmosPlanet_planetId_fkey" FOREIGN KEY ("planetId") REFERENCES "Planet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
