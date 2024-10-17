-- CreateTable
CREATE TABLE "TempChild" (
    "id" SERIAL NOT NULL,
    "childId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "universalPlanetCount" INTEGER NOT NULL,
    "temporaryChildrenId" INTEGER NOT NULL,

    CONSTRAINT "TempChild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemporaryChildrenSchema" (
    "id" SERIAL NOT NULL,
    "panrentAddress" TEXT NOT NULL,
    "planetName" TEXT NOT NULL,

    CONSTRAINT "TemporaryChildrenSchema_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TempChild" ADD CONSTRAINT "TempChild_temporaryChildrenId_fkey" FOREIGN KEY ("temporaryChildrenId") REFERENCES "TemporaryChildrenSchema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
