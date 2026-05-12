-- Add supplier_id as nullable for backfill
ALTER TABLE "products" ADD COLUMN "supplier_id" TEXT;

-- Backfill supplier_id from legacy supplier name
UPDATE "products" AS p
SET "supplier_id" = s."id"
FROM "suppliers" AS s
WHERE p."supplier_id" IS NULL
  AND p."supplier" IS NOT NULL
  AND LOWER(TRIM(p."supplier")) = LOWER(TRIM(s."name"));

-- Fallback: assign first active supplier for unresolved rows
UPDATE "products" AS p
SET "supplier_id" = s."id"
FROM LATERAL (
  SELECT "id"
  FROM "suppliers"
  WHERE "status" = true
  ORDER BY "name" ASC
  LIMIT 1
) AS s
WHERE p."supplier_id" IS NULL;

-- Enforce required supplier relation
ALTER TABLE "products" ALTER COLUMN "supplier_id" SET NOT NULL;

-- Remove legacy free-text supplier column
ALTER TABLE "products" DROP COLUMN "supplier";

-- Add index and FK
CREATE INDEX "products_supplier_id_idx" ON "products"("supplier_id");

ALTER TABLE "products"
ADD CONSTRAINT "products_supplier_id_fkey"
FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
