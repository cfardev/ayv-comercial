-- Step 1: Add code column as nullable first (for existing data compatibility)
ALTER TABLE "products" ADD COLUMN "code" TEXT;

-- Step 2: Backfill existing products with a generated code based on their id
UPDATE "products"
SET code = 'PROD-' || UPPER(SUBSTRING(id FROM 1 FOR 8))
WHERE code IS NULL;

-- Step 3: Make code NOT NULL
ALTER TABLE "products" ALTER COLUMN "code" SET NOT NULL;

-- Step 4: Add unique constraint on code
CREATE UNIQUE INDEX "products_code_key" ON "products"("code");

-- Step 5: Add index for code searches
CREATE INDEX "products_code_idx" ON "products"("code");

-- Step 6: Add new optional fields
ALTER TABLE "products" ADD COLUMN "unit_of_measure" TEXT;
ALTER TABLE "products" ADD COLUMN "minimum_stock" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "products" ADD COLUMN "supplier" TEXT;
