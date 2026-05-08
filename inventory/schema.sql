CREATE TABLE IF NOT EXISTS InventoryUnit (
  id TEXT PRIMARY KEY,
  tower TEXT NOT NULL,
  flatNumber TEXT NOT NULL,
  sizeSqft INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('4 Room', '5 Room', 'Duplex', 'Economy')),
  viewCategory TEXT NOT NULL CHECK (viewCategory IN ('Golf View', 'Arabian Sea View', 'Other View')),
  price NUMERIC NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Available', 'Reserved', 'Sold')),
  customerName TEXT,
  notes TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_inventory_tower ON InventoryUnit (tower);
CREATE INDEX IF NOT EXISTS idx_inventory_view_category ON InventoryUnit (viewCategory);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON InventoryUnit (status);
CREATE INDEX IF NOT EXISTS idx_inventory_type ON InventoryUnit (type);
CREATE INDEX IF NOT EXISTS idx_inventory_flat_number ON InventoryUnit (flatNumber);
