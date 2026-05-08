-- CreateEnum
DO $$
BEGIN
  CREATE TYPE "InventoryStatus" AS ENUM (
    'available',
    'interested',
    'viewing',
    'deposit_secured',
    'payment_secured',
    'sold_assigned'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "inventory_units" (
  "id" TEXT NOT NULL,
  "tower" TEXT NOT NULL,
  "flat_number" TEXT NOT NULL,
  "size_sqft" INTEGER NOT NULL,
  "type" TEXT NOT NULL,
  "view_category" TEXT NOT NULL,
  "price" BIGINT NOT NULL,
  "status" "InventoryStatus" NOT NULL DEFAULT 'available',
  "customer_name" TEXT,
  "notes" TEXT,
  "lead_id" TEXT,
  "status_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "inventory_units_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "inventory_units_flat_number_key" ON "inventory_units"("flat_number");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "inventory_units_status_idx" ON "inventory_units"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "inventory_units_tower_idx" ON "inventory_units"("tower");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "inventory_units_view_category_idx" ON "inventory_units"("view_category");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "inventory_units_lead_id_idx" ON "inventory_units"("lead_id");

-- AddForeignKey
DO $$
BEGIN
  IF to_regclass('public.leads') IS NOT NULL THEN
    ALTER TABLE "inventory_units"
      ADD CONSTRAINT "inventory_units_lead_id_fkey"
      FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

