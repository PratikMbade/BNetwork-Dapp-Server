-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "bn_id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "sponser_address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CosmosPlanet" (
    "id" SERIAL NOT NULL,
    "planetNum" INTEGER NOT NULL,
    "planetName" TEXT NOT NULL,
    "planetPrice" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "CosmosPlanet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_wallet_address_key" ON "User"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "CosmosPlanet_userId_planetNum_key" ON "CosmosPlanet"("userId", "planetNum");

-- AddForeignKey
ALTER TABLE "CosmosPlanet" ADD CONSTRAINT "CosmosPlanet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
