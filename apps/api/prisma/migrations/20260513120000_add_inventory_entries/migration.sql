-- CreateTable
CREATE TABLE "inventory_entries" (
    "id" TEXT NOT NULL,
    "entry_number" TEXT NOT NULL,
    "purchase_order_id" TEXT NOT NULL,
    "entry_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_entry_items" (
    "id" TEXT NOT NULL,
    "inventory_entry_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity_received" INTEGER NOT NULL,
    "lot_number" TEXT,
    "expiration_date" TIMESTAMP(3),

    CONSTRAINT "inventory_entry_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inventory_entries_entry_number_key" ON "inventory_entries"("entry_number");

-- CreateIndex
CREATE INDEX "inventory_entries_purchase_order_id_idx" ON "inventory_entries"("purchase_order_id");

-- CreateIndex
CREATE INDEX "inventory_entries_created_by_idx" ON "inventory_entries"("created_by");

-- CreateIndex
CREATE INDEX "inventory_entries_created_at_idx" ON "inventory_entries"("created_at");

-- CreateIndex
CREATE INDEX "inventory_entry_items_inventory_entry_id_idx" ON "inventory_entry_items"("inventory_entry_id");

-- CreateIndex
CREATE INDEX "inventory_entry_items_product_id_idx" ON "inventory_entry_items"("product_id");

-- AddForeignKey
ALTER TABLE "inventory_entries" ADD CONSTRAINT "inventory_entries_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_entries" ADD CONSTRAINT "inventory_entries_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_entry_items" ADD CONSTRAINT "inventory_entry_items_inventory_entry_id_fkey" FOREIGN KEY ("inventory_entry_id") REFERENCES "inventory_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_entry_items" ADD CONSTRAINT "inventory_entry_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
