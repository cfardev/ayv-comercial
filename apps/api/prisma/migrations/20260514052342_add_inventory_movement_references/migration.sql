-- AlterTable
ALTER TABLE "inventory_movements" ADD COLUMN     "reference_id" TEXT,
ADD COLUMN     "reference_type" TEXT;

-- CreateIndex
CREATE INDEX "inventory_movements_reference_id_idx" ON "inventory_movements"("reference_id");
