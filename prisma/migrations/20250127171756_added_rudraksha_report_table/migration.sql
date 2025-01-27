/*
  Warnings:

  - You are about to drop the `Report` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Report";

-- CreateTable
CREATE TABLE "GemReport" (
    "id" SERIAL NOT NULL,
    "reportNumber" TEXT NOT NULL,
    "conclusions" TEXT,
    "species" TEXT,
    "weight" TEXT,
    "colour" TEXT,
    "shapeCut" TEXT,
    "dimensions" TEXT,
    "opticCharacter" TEXT,
    "refractiveIndex" TEXT,
    "specificGravity" TEXT,
    "magnification" TEXT,
    "remarks" TEXT,
    "imageUrl" TEXT,

    CONSTRAINT "GemReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RudrakshaReport" (
    "id" SERIAL NOT NULL,
    "reportNumber" TEXT NOT NULL,
    "weight" TEXT,
    "colour" TEXT,
    "mounted" TEXT,
    "shape" TEXT,
    "dimension" TEXT,
    "naturalFaces" TEXT,
    "artificialFaces" TEXT,
    "testCameOut" TEXT,
    "xRayResult" TEXT,
    "origin" TEXT,
    "comment" TEXT,

    CONSTRAINT "RudrakshaReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GemReport_reportNumber_key" ON "GemReport"("reportNumber");

-- CreateIndex
CREATE UNIQUE INDEX "RudrakshaReport_reportNumber_key" ON "RudrakshaReport"("reportNumber");
