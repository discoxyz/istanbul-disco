-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "link" TEXT,
ADD COLUMN     "paid" BOOLEAN NOT NULL DEFAULT false;
