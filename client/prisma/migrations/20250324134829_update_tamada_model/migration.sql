/*
  Warnings:

  - Added the required column `alcoholTolerance` to the `Tamada` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clothingStyle` to the `Tamada` table without a default value. This is not possible if the table is not empty.
  - Added the required column `experienceYears` to the `Tamada` table without a default value. This is not possible if the table is not empty.
  - Added the required column `humorLevel` to the `Tamada` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nationality` to the `Tamada` table without a default value. This is not possible if the table is not empty.
  - Added the required column `speechQuality` to the `Tamada` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tamada" ADD COLUMN     "alcoholTolerance" INTEGER NOT NULL,
ADD COLUMN     "awards" TEXT[],
ADD COLUMN     "clothingStyle" TEXT NOT NULL,
ADD COLUMN     "eventTypes" TEXT[],
ADD COLUMN     "experienceYears" INTEGER NOT NULL,
ADD COLUMN     "humorLevel" INTEGER NOT NULL,
ADD COLUMN     "nationality" TEXT NOT NULL,
ADD COLUMN     "popularityScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "speechQuality" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Tamada_experienceYears_idx" ON "Tamada"("experienceYears");

-- CreateIndex
CREATE INDEX "Tamada_popularityScore_idx" ON "Tamada"("popularityScore");
