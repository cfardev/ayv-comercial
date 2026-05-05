-- AlterTable
ALTER TABLE "brands" ADD COLUMN "description" TEXT;

-- AlterTable
ALTER TABLE "brands" ADD COLUMN "status" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "brands" ADD COLUMN "logo_url" TEXT;

-- CreateIndex
CREATE INDEX "brands_status_idx" ON "brands"("status");
