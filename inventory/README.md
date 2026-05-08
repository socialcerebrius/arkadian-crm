# Arkadians Inventory Module

Simple inventory (stock list) for flats, designed for non-technical staff.

## What it includes

- Main category focus: **View Category** (highlighted in form/filter and prioritized in list order)
- Flat fields:
  - Tower
  - Flat Number
  - Size / Sq Ft
  - Type (`4 Room`, `5 Room`, `Duplex`, `Economy`)
  - View Category (`Golf View`, `Arabian Sea View`, `Other View`)
  - Price
  - Status (`Available`, `Reserved`, `Sold`)
  - Customer / Lead Name
  - Notes
- Filters:
  - Tower
  - View Category
  - Status
  - Type
  - Search Flat Number
- Table columns:
  - Flat No
  - Tower
  - View Category
  - Type
  - Size
  - Price
  - Status
  - Customer
  - Actions
- Summary cards:
  - Total Flats
  - Available
  - Reserved
  - Sold
  - Golf View
  - Arabian Sea View

## Files

- `index.html` - UI layout
- `styles.css` - simple styling
- `app.js` - inventory logic (uses browser localStorage)
- `schema.sql` - database model for `InventoryUnit`

## Usage

Open `index.html` in a browser.

Data is stored locally in browser storage key:

- `arkadians_inventory_units`

This module is intentionally basic for non-technical staff and does not include complex property management features.
