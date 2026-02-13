# Axmed PO Prototype — Project Context

## What We're Building

An **admin dashboard prototype** for the "Send Purchase Order to Supplier" workflow at Axmed. This bridges the gap between buyers submitting a PO (items marked **PO submitted**) and the supplier receiving a notification to confirm their supply.

This is a **frontend-only prototype** (mock data, no backend) used to validate the workflow and UX with stakeholders before moving to design and technical planning.

---

## Tech Stack

- **React 18** + **TypeScript** + **Vite**
- **Ant Design 5** (component library + theme tokens)
- **React Router DOM** (HashRouter, client-side routing)
- **Font:** Figtree (Google Fonts)
- **Primary Color:** `#392AB0` (purple)

---

## Design System

Matches the existing Axmed admin dashboard:

| Token | Value |
|-------|-------|
| Primary color | `#392AB0` |
| Border radius | 6px (default), 8px, 12px (cards) |
| Font family | Figtree, system fallbacks |
| Font weights | 400, 500, 600, 700 |
| Backgrounds | `#f8f9fc`, `#fafafa`, `#f5f5ff` |
| Borders | `#f0f0f0`, `#e8e8e8`, `#d9d9d9` |
| Text colors | `rgba(0,0,0,0.88)`, `rgba(0,0,0,0.65)`, `rgba(0,0,0,0.45)` |
| Shadows | `0 2px 8px rgba(0,0,0,0.1)` (subtle), `0 4px 16px rgba(0,0,0,0.12)` (medium) |

**Layout:** Collapsible left sidebar + top header bar (purple) + white content area. Admin user icon top-right.

---

## Core Workflow (Happy Path)

```
Buyer submits PO
  → Admin sees "PO submitted" + "Selected supplier" on Buyer Evaluation page
  → Admin selects items → clicks "Initiate draft PO"
  → Side panel shows aggregation cards (grouped by supplier + incoterm + ship-to)
  → "Create draft POs" → routes to Finance page
  → Finance page lists all POs (Draft → Cleared by Commercial → Submitted → Confirmed)
  → Click "Review" on a draft → PO Review page (form left + document preview right)
  → Commercial fills fields → "Mark as completed" → goes to Finance
  → Finance reviews → "Send" → award emails to suppliers
  → Supplier receives email → navigates to Awards tab → confirms supply
  → Technical enrichment → POs appear in Fulfillment view (Confirmed tab)
```

---

## Pages & Navigation

### Sidebar (Admin)

```
Dashboard
Tender Cycles
  └─ Cycle Information
Buyers
  └─ Orders
  └─ Order Items
  └─ Bulk Upload Orders
  └─ Organizations
  └─ Users
Suppliers
  └─ Organizations
  └─ Users
  └─ Quotations
  └─ Bulk Upload Portfolios
Supply Chain
Medicine Catalogue
  └─ SKUs
  └─ SKU Categories
  └─ INNs
  └─ Therapy Areas
  └─ Presentations
Finance (NEW)
  └─ Purchase Orders
```

### Key Pages to Build

1. **Buyer Evaluation** — Table of order items with status, selected supplier. "Initiate draft PO" action on selected PO-submitted items.

2. **Initiate Draft PO (Side Panel / Drawer)** — Shows aggregation cards. Per card: supplier name, incoterms, # SKUs, ship-to, value. Grand total. "Create draft POs" button.

3. **Finance / Purchase Orders page** — Summary cards (Total POs, Total value, Draft, Cleared, Confirmed). Table: PO#, Supplier, Cycle, Status, Amount, Actions (Delete, Review).

4. **PO Review / Draft page** — Left: form fields (vendor, bill-to, ship-to, PO details, terms, currency). Right: PO document preview. Actions: Save as draft, Mark as completed (commercial), Send (finance).

5. **Supplier Awards tab** — List of awarded SKUs. Confirm supply per item. Planned shipment table (PO# | Location | Quantity). Technical enrichment fields.

6. **Fulfillment View (Confirmed tab)** — Accordion grouped by ship-from location. Each location expands to table: Date Confirmed, PO#, # SKUs, Value, Status, Incoterm, Ship-To, Actions (Download, Upload Invoice).

---

## Draft PO Grouping Logic

POs are split by these dimensions:

| Dimension | Description |
|-----------|-------------|
| **Supplier** | The selected supplier for the line |
| **Incoterms** | Incoterm + location (e.g. "FOB Casablanca") |
| **Ship-to** | Buyer's delivery address (city + country) |

Same supplier + same incoterm + same ship-to = one draft PO.

---

## PO Lifecycle States

1. **Draft** — Created from "Create draft POs"
2. **Cleared by Commercial** — Commercial marked as completed
3. **Submitted** — Finance sent to supplier
4. **Confirmed** — Supplier fully confirmed all lines
5. **Partially Confirmed** — At least one line confirmed, not all

---

## PO Document Structure

### Header
Axmed logo, blue header

### Sections
1. **Vendor details** (supplier org address + contact dropdown)
2. **Bill-to** (legal entity: Axmed EA / WA / PBC)
3. **Ship-to** (Axmed name + buyer's address, buyer name hidden)
4. **PO details** (PO#, terms, reference, date, currency, incoterms)
5. **Order items table** (Product, Description, Quantity, Rate, Amount — packs or units toggle)
6. **Totals** (Subtotal, VAT %, Total)
7. **Legal notes** (standard supply terms + acceptance block)

### PO Number Format
`PO/{LegalEntityAbbrev}/{YYYY-MMDD}/{3-digit sequential}`
Example: `PO/WA/2026-0210/001`

Sequential per legal entity per day.

---

## Key Decisions

| Area | Decision |
|------|----------|
| Scope | Single buyer PO only; no cross-PO selection |
| Missing data | No missing incoterm or ship-to (always present) |
| Draft failure | Roll back all on partial failure |
| Delete draft | Reverts items to buyer evaluation |
| Finance page | Shows all cycles; filter by cycle available |
| Reference numbers | Multiple as list if multi-order |
| Ship-to on PO | Can have multiple ship-to blocks |
| Vendor contact | Manual entry if no org contact (email, first name, last name) |
| Legal entity | Required — block progression if missing |
| Pack size | Force units if no pack size |
| Currency | One per PO; USD default; options: USD, EUR, GBP |
| VAT | Set by finance; variable percentage |
| Edit after complete | Commercial cannot edit after "Mark as completed" |
| Send back | Finance can send PO back to draft |
| Award emails | Per SKU |
| Supplier email | Required; free-form if org has none |
| PO sequence | Per legal entity per day |
| PO# timing | Generated at Send/Submit |
| Partial confirm | Supported; all confirmed = Confirmed status |
| Enrichment | Required before Confirmed tab |
| Cancel after submit | Deferred for V1 |
| Ready for Pickup | Out of scope |
| Notifications | Deferred — process first |

---

## Payment Terms Options

- Advance payment
- Payment on delivery
- Net 30 on delivery (default)
- 40% upfront / 60% upon delivery
- Net 45 on delivery
- 50% upfront / 50% upon delivery
- Net 60 on delivery
- Net 90 on delivery
- 50% upfront, balance 30 days from delivery
- 50% upfront, 50% on delivery

---

## Legal Entities

| Entity | Abbreviation |
|--------|-------------|
| Axmed West Africa | WA |
| Axmed East Africa | EA |
| Axmed PBC | PBC |

---

## Fulfillment View Behavior

- Accordion with "New" badge (per user)
- Accordions with New records expanded by default
- Sorted by Date Confirmed (newest first)
- Global: Search by PO#, date range filter, location filter
- Download All POs (ZIP) per location
- Download PO / Upload Invoice per row
- Ship-From Location grouping (warehouse-centric for supplier fulfillment teams)
