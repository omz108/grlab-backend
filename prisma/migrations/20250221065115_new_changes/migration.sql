/*
  Warnings:

  - You are about to drop the column `conclusions` on the `GemReport` table. All the data in the column will be lost.
  - You are about to drop the column `dimensions` on the `GemReport` table. All the data in the column will be lost.
  - You are about to drop the column `magnification` on the `GemReport` table. All the data in the column will be lost.
  - You are about to drop the column `species` on the `GemReport` table. All the data in the column will be lost.
  - You are about to drop the column `artificialFaces` on the `RudrakshaReport` table. All the data in the column will be lost.
  - You are about to drop the column `comment` on the `RudrakshaReport` table. All the data in the column will be lost.
  - You are about to drop the column `mounted` on the `RudrakshaReport` table. All the data in the column will be lost.
  - You are about to drop the column `naturalFaces` on the `RudrakshaReport` table. All the data in the column will be lost.
  - You are about to drop the column `origin` on the `RudrakshaReport` table. All the data in the column will be lost.
  - You are about to drop the column `xRayResult` on the `RudrakshaReport` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GemReport" DROP COLUMN "conclusions",
DROP COLUMN "dimensions",
DROP COLUMN "magnification",
DROP COLUMN "species",
ADD COLUMN     "dimension" TEXT,
ADD COLUMN     "gemStoneName" TEXT;

-- AlterTable
ALTER TABLE "RudrakshaReport" DROP COLUMN "artificialFaces",
DROP COLUMN "comment",
DROP COLUMN "mounted",
DROP COLUMN "naturalFaces",
DROP COLUMN "origin",
DROP COLUMN "xRayResult",
ADD COLUMN     "artificialFace" TEXT,
ADD COLUMN     "realFace" TEXT,
ADD COLUMN     "remarks" TEXT;
