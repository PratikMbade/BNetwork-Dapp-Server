/*
  Warnings:

  - The primary key for the `Ancestors` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `AutoPool` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Children` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `DirectTeam` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `EarningHistory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `EarningInfo` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `IndexMapping` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `RecycleMapping` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TempChild` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TemporaryChildrenSchema` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "AutoPool" DROP CONSTRAINT "AutoPool_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Children" DROP CONSTRAINT "Children_parentId_fkey";

-- DropForeignKey
ALTER TABLE "EarningHistory" DROP CONSTRAINT "EarningHistory_autoPoolId_fkey";

-- DropForeignKey
ALTER TABLE "IndexMapping" DROP CONSTRAINT "IndexMapping_recycleMappingId_fkey";

-- DropForeignKey
ALTER TABLE "RecycleMapping" DROP CONSTRAINT "RecycleMapping_autoPoolId_fkey";

-- DropForeignKey
ALTER TABLE "TempChild" DROP CONSTRAINT "TempChild_temporaryChildrenId_fkey";

-- DropForeignKey
ALTER TABLE "_IndexMappingUserIds" DROP CONSTRAINT "_IndexMappingUserIds_A_fkey";

-- AlterTable
ALTER TABLE "Ancestors" DROP CONSTRAINT "Ancestors_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Ancestors_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Ancestors_id_seq";

-- AlterTable
ALTER TABLE "AutoPool" DROP CONSTRAINT "AutoPool_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "parentId" SET DATA TYPE TEXT,
ALTER COLUMN "childrenId" SET DATA TYPE TEXT,
ADD CONSTRAINT "AutoPool_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "AutoPool_id_seq";

-- AlterTable
ALTER TABLE "Children" DROP CONSTRAINT "Children_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "parentId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Children_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Children_id_seq";

-- AlterTable
ALTER TABLE "DirectTeam" DROP CONSTRAINT "DirectTeam_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "DirectTeam_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "DirectTeam_id_seq";

-- AlterTable
ALTER TABLE "EarningHistory" DROP CONSTRAINT "EarningHistory_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "autoPoolId" SET DATA TYPE TEXT,
ADD CONSTRAINT "EarningHistory_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "EarningHistory_id_seq";

-- AlterTable
ALTER TABLE "EarningInfo" DROP CONSTRAINT "EarningInfo_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "EarningInfo_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "EarningInfo_id_seq";

-- AlterTable
ALTER TABLE "IndexMapping" DROP CONSTRAINT "IndexMapping_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "recycleMappingId" SET DATA TYPE TEXT,
ADD CONSTRAINT "IndexMapping_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "IndexMapping_id_seq";

-- AlterTable
ALTER TABLE "RecycleMapping" DROP CONSTRAINT "RecycleMapping_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "autoPoolId" SET DATA TYPE TEXT,
ADD CONSTRAINT "RecycleMapping_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "RecycleMapping_id_seq";

-- AlterTable
ALTER TABLE "TempChild" DROP CONSTRAINT "TempChild_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "temporaryChildrenId" SET DATA TYPE TEXT,
ALTER COLUMN "childId" SET DATA TYPE TEXT,
ADD CONSTRAINT "TempChild_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "TempChild_id_seq";

-- AlterTable
ALTER TABLE "TemporaryChildrenSchema" DROP CONSTRAINT "TemporaryChildrenSchema_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "TemporaryChildrenSchema_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "TemporaryChildrenSchema_id_seq";

-- AlterTable
ALTER TABLE "_IndexMappingUserIds" ALTER COLUMN "A" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "AutoPool" ADD CONSTRAINT "AutoPool_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "AutoPool"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Children" ADD CONSTRAINT "Children_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "AutoPool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecycleMapping" ADD CONSTRAINT "RecycleMapping_autoPoolId_fkey" FOREIGN KEY ("autoPoolId") REFERENCES "AutoPool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndexMapping" ADD CONSTRAINT "IndexMapping_recycleMappingId_fkey" FOREIGN KEY ("recycleMappingId") REFERENCES "RecycleMapping"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EarningHistory" ADD CONSTRAINT "EarningHistory_autoPoolId_fkey" FOREIGN KEY ("autoPoolId") REFERENCES "AutoPool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TempChild" ADD CONSTRAINT "TempChild_temporaryChildrenId_fkey" FOREIGN KEY ("temporaryChildrenId") REFERENCES "TemporaryChildrenSchema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IndexMappingUserIds" ADD CONSTRAINT "_IndexMappingUserIds_A_fkey" FOREIGN KEY ("A") REFERENCES "IndexMapping"("id") ON DELETE CASCADE ON UPDATE CASCADE;
