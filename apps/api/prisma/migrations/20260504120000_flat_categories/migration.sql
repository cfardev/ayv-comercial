-- Flatten category hierarchy into a single list; restore global unique name.

UPDATE "categories" SET "parent_id" = NULL, "depth" = 0;

WITH ranked AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (PARTITION BY LOWER("name") ORDER BY "id") AS rn
  FROM "categories"
)
UPDATE "categories" AS c
SET "name" = c."name" || ' (' || LEFT(c."id", 8) || ')'
FROM ranked AS r
WHERE c."id" = r."id" AND r.rn > 1;

ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_parent_id_fkey";

DROP INDEX IF EXISTS "categories_parent_id_idx";
DROP INDEX IF EXISTS "categories_name_idx";

ALTER TABLE "categories" DROP COLUMN IF EXISTS "parent_id",
DROP COLUMN IF EXISTS "depth";

CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");
