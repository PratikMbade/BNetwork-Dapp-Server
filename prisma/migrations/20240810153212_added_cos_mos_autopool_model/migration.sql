-- CreateTable
CREATE TABLE "AutoPool" (
    "id" SERIAL NOT NULL,
    "bn_id" TEXT NOT NULL,
    "planetName" TEXT,
    "reg_user_address" TEXT NOT NULL,
    "universeSlot" INTEGER,
    "parentId" INTEGER,
    "currentLevel" INTEGER,
    "currentPosition" INTEGER,
    "autoPoolEarning" DOUBLE PRECISION,
    "isRoot" BOOLEAN NOT NULL DEFAULT false,
    "canHaveMoreChildren" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AutoPool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Children" (
    "id" SERIAL NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "autoPoolId" INTEGER NOT NULL,

    CONSTRAINT "Children_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecycleMapping" (
    "id" SERIAL NOT NULL,
    "recycleCount" INTEGER NOT NULL DEFAULT 0,
    "autoPoolId" INTEGER NOT NULL,

    CONSTRAINT "RecycleMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndexMapping" (
    "id" SERIAL NOT NULL,
    "userLevel" INTEGER NOT NULL,
    "userPosition" INTEGER NOT NULL,
    "recycleMappingId" INTEGER NOT NULL,

    CONSTRAINT "IndexMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EarningHistory" (
    "id" SERIAL NOT NULL,
    "recycleNumber" INTEGER NOT NULL,
    "reg_user_address" TEXT NOT NULL,
    "bn_id" TEXT NOT NULL,
    "planetName" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currentPosition" INTEGER NOT NULL,
    "currentLevel" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "autoPoolId" INTEGER NOT NULL,

    CONSTRAINT "EarningHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_IndexMappingUserIds" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "AutoPool_bn_id_key" ON "AutoPool"("bn_id");

-- CreateIndex
CREATE UNIQUE INDEX "AutoPool_reg_user_address_key" ON "AutoPool"("reg_user_address");

-- CreateIndex
CREATE UNIQUE INDEX "_IndexMappingUserIds_AB_unique" ON "_IndexMappingUserIds"("A", "B");

-- CreateIndex
CREATE INDEX "_IndexMappingUserIds_B_index" ON "_IndexMappingUserIds"("B");

-- AddForeignKey
ALTER TABLE "AutoPool" ADD CONSTRAINT "AutoPool_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "AutoPool"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Children" ADD CONSTRAINT "Children_autoPoolId_fkey" FOREIGN KEY ("autoPoolId") REFERENCES "AutoPool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecycleMapping" ADD CONSTRAINT "RecycleMapping_autoPoolId_fkey" FOREIGN KEY ("autoPoolId") REFERENCES "AutoPool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndexMapping" ADD CONSTRAINT "IndexMapping_recycleMappingId_fkey" FOREIGN KEY ("recycleMappingId") REFERENCES "RecycleMapping"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EarningHistory" ADD CONSTRAINT "EarningHistory_autoPoolId_fkey" FOREIGN KEY ("autoPoolId") REFERENCES "AutoPool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IndexMappingUserIds" ADD CONSTRAINT "_IndexMappingUserIds_A_fkey" FOREIGN KEY ("A") REFERENCES "IndexMapping"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IndexMappingUserIds" ADD CONSTRAINT "_IndexMappingUserIds_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
