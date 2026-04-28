-- AlterTable roles: replace RoleName enum with slug + display name
ALTER TABLE "roles" ADD COLUMN "slug" TEXT;
ALTER TABLE "roles" ADD COLUMN "name_new" TEXT;
ALTER TABLE "roles" ADD COLUMN "description" TEXT;
ALTER TABLE "roles" ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "roles" ADD COLUMN "is_system" BOOLEAN NOT NULL DEFAULT false;

UPDATE "roles" SET "slug" = "name"::text;

UPDATE "roles" SET "name_new" = CASE "name"::text
  WHEN 'ADMIN' THEN 'Administrador'
  WHEN 'SELLER' THEN 'Vendedor'
  WHEN 'INVENTORY_MANAGER' THEN 'Encargado de inventario'
  WHEN 'DISPATCH_MANAGER' THEN 'Encargado de despacho'
  WHEN 'OWNER_MANAGER' THEN 'Propietario o gerente'
  ELSE "name"::text
END;

UPDATE "roles" SET "is_system" = true WHERE "slug" = 'ADMIN';

DROP INDEX "roles_name_key";

ALTER TABLE "roles" DROP COLUMN "name";

ALTER TABLE "roles" RENAME COLUMN "name_new" TO "name";

ALTER TABLE "roles" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "roles" ALTER COLUMN "name" SET NOT NULL;

CREATE UNIQUE INDEX "roles_slug_key" ON "roles"("slug");
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

DROP TYPE "RoleName";

-- AlterTable permissions
ALTER TABLE "permissions" ADD COLUMN "is_critical" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable role_audit_logs
CREATE TABLE "role_audit_logs" (
    "id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "role_audit_logs_role_id_idx" ON "role_audit_logs"("role_id");
CREATE INDEX "role_audit_logs_actor_id_idx" ON "role_audit_logs"("actor_id");
CREATE INDEX "role_audit_logs_created_at_idx" ON "role_audit_logs"("created_at");

ALTER TABLE "role_audit_logs" ADD CONSTRAINT "role_audit_logs_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "role_audit_logs" ADD CONSTRAINT "role_audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
