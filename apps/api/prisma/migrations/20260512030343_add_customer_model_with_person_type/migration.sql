/*
  Warnings:

  - You are about to drop the `clients` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PersonType" AS ENUM ('NATURAL', 'JURIDICA');

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_client_id_fkey";

-- DropForeignKey
ALTER TABLE "sales" DROP CONSTRAINT "sales_client_id_fkey";

-- DropTable
DROP TABLE "clients";

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "person_type" "PersonType" NOT NULL,
    "full_name" TEXT NOT NULL,
    "tax_id" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_tax_id_key" ON "customers"("tax_id");

-- CreateIndex
CREATE INDEX "customers_tax_id_idx" ON "customers"("tax_id");

-- CreateIndex
CREATE INDEX "customers_full_name_idx" ON "customers"("full_name");

-- CreateIndex
CREATE INDEX "customers_is_active_idx" ON "customers"("is_active");

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
