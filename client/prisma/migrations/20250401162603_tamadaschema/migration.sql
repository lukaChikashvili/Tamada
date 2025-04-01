/*
  Warnings:

  - You are about to drop the column `alcoholTolerance` on the `Tamada` table. All the data in the column will be lost.
  - You are about to drop the column `awards` on the `Tamada` table. All the data in the column will be lost.
  - You are about to drop the column `features` on the `Tamada` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Tamada_features_idx";

-- AlterTable
ALTER TABLE "Tamada" DROP COLUMN "alcoholTolerance",
DROP COLUMN "awards",
DROP COLUMN "features",
ALTER COLUMN "eventTypes" SET NOT NULL,
ALTER COLUMN "eventTypes" SET DATA TYPE TEXT;
