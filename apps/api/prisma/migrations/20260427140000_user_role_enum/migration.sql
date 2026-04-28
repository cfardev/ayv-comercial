-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SELLER', 'INVENTORY_MANAGER', 'DISPATCH_MANAGER', 'OWNER_MANAGER');

-- AlterTable: add enum column and backfill from roles.slug
ALTER TABLE "users" ADD COLUMN "role" "UserRole";

UPDATE "users" AS u
SET "role" = r."slug"::"UserRole"
FROM "roles" AS r
WHERE u."role_id" = r."id";

ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL;

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_role_id_fkey";

-- DropIndex
DROP INDEX "users_role_id_idx";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role_id";

-- DropTable (order: dependents first)
DROP TABLE "role_audit_logs";
DROP TABLE "role_permissions";
DROP TABLE "permissions";
DROP TABLE "roles";

-- Index for role filter
CREATE INDEX "users_role_idx" ON "users"("role");
