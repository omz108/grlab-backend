-- CreateTable
CREATE TABLE "Report" (
    "id" SERIAL NOT NULL,
    "reportType" TEXT,
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

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);
