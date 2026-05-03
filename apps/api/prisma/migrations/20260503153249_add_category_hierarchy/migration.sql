-- DropIndex
DROP INDEX "categories_name_key";

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "depth" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "parent_id" TEXT;

-- CreateIndex
CREATE INDEX "categories_parent_id_idx" ON "categories"("parent_id");

-- CreateIndex
CREATE INDEX "categories_status_idx" ON "categories"("status");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
