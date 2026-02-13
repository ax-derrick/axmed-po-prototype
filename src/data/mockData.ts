// =============================================================================
// Axmed PO Prototype - Comprehensive Mock Data
// =============================================================================

// -----------------------------------------------------------------------------
// Interfaces
// -----------------------------------------------------------------------------

export interface OrderItem {
  id: string;
  orderNumber: string;
  buyerName: string;
  productName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  packSize: number;
  packPrice: number;
  currency: string;
  status:
    | 'quotation_ready'
    | 'quotation_selected'
    | 'po_submitted'
    | 'supplier_yet_to_confirm'
    | 'confirmed_for_supply';
  selectedSupplier: string;
  supplierOrgId: string;
  incoterm: string;
  incotermLocation: string;
  shipToCity: string;
  shipToCountry: string;
  shipToAddress: string;
  cycleName: string;
  cycleId: string;
  buyerPoNumber: string;
}

export interface DraftPOGroup {
  supplier: string;
  supplierOrgId: string;
  incoterm: string;
  incotermLocation: string;
  shipToCity: string;
  shipToCountry: string;
  skuCount: number;
  items: OrderItem[];
  totalValue: number;
}

export interface POLineItem {
  id: string;
  product: string;
  description: string;
  quantity: number;
  unitPrice: number;
  packSize: number;
  packPrice: number;
  amount: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  cycleName: string;
  cycleId: string;
  status:
    | 'draft'
    | 'cleared_by_commercial'
    | 'submitted'
    | 'confirmed'
    | 'partially_confirmed';
  totalAmount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  legalEntity: string;
  legalEntityAbbrev: string;
  vendorAddress: string;
  vendorContact: string;
  vendorEmail: string;
  billToEntity: string;
  billToAddress: string;
  shipToName: string;
  shipToAddress: string;
  shipToCity: string;
  shipToCountry: string;
  terms: string;
  referenceNumber: string;
  date: string;
  incoterm: string;
  vatPercent: number;
  lineItems: POLineItem[];
}

export interface PlannedShipment {
  poNumber: string;
  location: string;
  quantity: number;
  totalQuantity: number;
  percentage: number;
}

export interface TechnicalEnrichment {
  dangerousGoods: boolean;
  storageTemp: string;
  shelfLife: string;
  batchNumber: string;
}

export interface SupplierAward {
  id: string;
  skuName: string;
  description: string;
  totalQuantity: number;
  unitPrice: number;
  currency: string;
  status:
    | 'pending_confirmation'
    | 'confirmed'
    | 'partially_confirmed'
    | 'withdrawn';
  plannedShipments: PlannedShipment[];
  technicalEnrichment?: TechnicalEnrichment;
}

export interface FulfillmentPO {
  dateConfirmed: string;
  poNumber: string;
  skuCount: number;
  value: number;
  currency: string;
  status: 'confirmed' | 'ready_for_pickup' | 'collected' | 'invoiced';
  incotermSpec: string;
  shipTo: string;
  isNew: boolean;
}

export interface FulfillmentLocation {
  city: string;
  country: string;
  newCount: number;
  purchaseOrders: FulfillmentPO[];
}

export interface LegalEntity {
  id: string;
  name: string;
  abbreviation: string;
  address: string;
}

export interface SupplierOrg {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  contacts: { name: string; email: string; role: string }[];
}

// -----------------------------------------------------------------------------
// Legal Entities
// -----------------------------------------------------------------------------

export const legalEntities: LegalEntity[] = [
  {
    id: 'le-wa',
    name: 'Axmed West Africa Ltd',
    abbreviation: 'WA',
    address: '12 Independence Avenue, Accra, Ghana',
  },
  {
    id: 'le-ea',
    name: 'Axmed East Africa Ltd',
    abbreviation: 'EA',
    address: '45 Kenyatta Avenue, Nairobi, Kenya',
  },
  {
    id: 'le-pbc',
    name: 'Axmed PBC',
    abbreviation: 'PBC',
    address: '100 Market Street, Suite 300, San Francisco, CA 94105, USA',
  },
];

// -----------------------------------------------------------------------------
// Payment Terms
// -----------------------------------------------------------------------------

export const paymentTerms: string[] = [
  'Net 30 days',
  'Net 45 days',
  'Net 60 days',
  'Net 90 days',
  'Prepayment 100%',
  'Prepayment 50%, balance on delivery',
  'Letter of Credit at sight',
  'Letter of Credit 30 days',
  'Letter of Credit 60 days',
  'Cash against documents',
  'Open account 30 days',
  'Open account 60 days',
];

// -----------------------------------------------------------------------------
// Supplier Organizations
// -----------------------------------------------------------------------------

export const supplierOrganizations: SupplierOrg[] = [
  {
    id: 'sup-novartis',
    name: 'Novartis AG',
    address: 'Lichtstrasse 35, 4056 Basel',
    city: 'Basel',
    country: 'Switzerland',
    contacts: [
      {
        name: 'Stefan Mueller',
        email: 'stefan.mueller@novartis.com',
        role: 'Key Account Manager',
      },
      {
        name: 'Claudia Richter',
        email: 'claudia.richter@novartis.com',
        role: 'Supply Chain Lead',
      },
    ],
  },
  {
    id: 'sup-cipla',
    name: 'Cipla Ltd',
    address: 'Cipla House, Peninsula Business Park, Ganpatrao Kadam Marg',
    city: 'Mumbai',
    country: 'India',
    contacts: [
      {
        name: 'Rajesh Sharma',
        email: 'rajesh.sharma@cipla.com',
        role: 'Export Manager',
      },
      {
        name: 'Priya Nair',
        email: 'priya.nair@cipla.com',
        role: 'Regulatory Affairs',
      },
    ],
  },
  {
    id: 'sup-aurobindo',
    name: 'Aurobindo Pharma',
    address: 'Plot No. 2, Maitrivihar, Ameerpet',
    city: 'Hyderabad',
    country: 'India',
    contacts: [
      {
        name: 'Vikram Reddy',
        email: 'vikram.reddy@aurobindo.com',
        role: 'International Sales Director',
      },
      {
        name: 'Anita Desai',
        email: 'anita.desai@aurobindo.com',
        role: 'Logistics Coordinator',
      },
    ],
  },
  {
    id: 'sup-sun',
    name: 'Sun Pharmaceutical',
    address: 'Sun House, Plot No. 201 B/1, Western Express Highway, Goregaon East',
    city: 'Mumbai',
    country: 'India',
    contacts: [
      {
        name: 'Amit Patel',
        email: 'amit.patel@sunpharma.com',
        role: 'Business Development Manager',
      },
      {
        name: 'Neha Gupta',
        email: 'neha.gupta@sunpharma.com',
        role: 'Quality Assurance Lead',
      },
    ],
  },
];

// -----------------------------------------------------------------------------
// Order Items (Buyer Evaluation Page)
// -----------------------------------------------------------------------------

export const orderItems: OrderItem[] = [
  // --- Cycle 253 (10 items) ---
  {
    id: 'oi-001',
    orderNumber: 'ORD-253-001',
    buyerName: 'Ghana Health Service',
    productName: 'Amoxicillin 500mg Capsules',
    description: '100 caps/bottle, finished product, WHO prequalified',
    quantity: 500000,
    unitPrice: 0.032,
    packSize: 100,
    packPrice: 3.2,
    currency: 'USD',
    status: 'po_submitted',
    selectedSupplier: 'Cipla Ltd',
    supplierOrgId: 'sup-cipla',
    incoterm: 'FCA',
    incotermLocation: 'Mumbai',
    shipToCity: 'Accra',
    shipToCountry: 'Ghana',
    shipToAddress: 'Tema Port Free Zone, Warehouse 14, Accra, Ghana',
    cycleName: 'Cycle 253',
    cycleId: 'cycle-253',
    buyerPoNumber: 'GHS-2026-0089',
  },
  {
    id: 'oi-002',
    orderNumber: 'ORD-253-002',
    buyerName: 'Ghana Health Service',
    productName: 'Metformin 850mg Tablets',
    description: '60 tabs/blister pack, finished product, GMP certified',
    quantity: 300000,
    unitPrice: 0.045,
    packSize: 60,
    packPrice: 2.7,
    currency: 'USD',
    status: 'po_submitted',
    selectedSupplier: 'Cipla Ltd',
    supplierOrgId: 'sup-cipla',
    incoterm: 'FCA',
    incotermLocation: 'Mumbai',
    shipToCity: 'Accra',
    shipToCountry: 'Ghana',
    shipToAddress: 'Tema Port Free Zone, Warehouse 14, Accra, Ghana',
    cycleName: 'Cycle 253',
    cycleId: 'cycle-253',
    buyerPoNumber: 'GHS-2026-0090',
  },
  {
    id: 'oi-003',
    orderNumber: 'ORD-253-003',
    buyerName: 'Kenya Medical Supplies Authority',
    productName: 'Paracetamol 500mg Tablets',
    description: '1000 tabs/bottle, finished product, WHO prequalified',
    quantity: 1000000,
    unitPrice: 0.008,
    packSize: 1000,
    packPrice: 8.0,
    currency: 'USD',
    status: 'po_submitted',
    selectedSupplier: 'Aurobindo Pharma',
    supplierOrgId: 'sup-aurobindo',
    incoterm: 'CIF',
    incotermLocation: 'Mombasa',
    shipToCity: 'Nairobi',
    shipToCountry: 'Kenya',
    shipToAddress: 'KEMSA Central Warehouse, Commercial Street, Nairobi, Kenya',
    cycleName: 'Cycle 253',
    cycleId: 'cycle-253',
    buyerPoNumber: 'KEMSA-2026-0341',
  },
  {
    id: 'oi-004',
    orderNumber: 'ORD-253-004',
    buyerName: 'Nigeria Federal Ministry of Health',
    productName: 'Artemether/Lumefantrine 20/120mg Tablets',
    description: '24 tabs/blister pack, antimalarial combination, WHO prequalified',
    quantity: 800000,
    unitPrice: 0.12,
    packSize: 24,
    packPrice: 2.88,
    currency: 'USD',
    status: 'po_submitted',
    selectedSupplier: 'Novartis AG',
    supplierOrgId: 'sup-novartis',
    incoterm: 'EXW',
    incotermLocation: 'Leverkusen',
    shipToCity: 'Lagos',
    shipToCountry: 'Nigeria',
    shipToAddress: 'Apapa Wharf, Bonded Warehouse 7, Lagos, Nigeria',
    cycleName: 'Cycle 253',
    cycleId: 'cycle-253',
    buyerPoNumber: 'FMOH-NG-2026-0215',
  },
  {
    id: 'oi-005',
    orderNumber: 'ORD-253-005',
    buyerName: 'Nigeria Federal Ministry of Health',
    productName: 'Ciprofloxacin 500mg Tablets',
    description: '10 tabs/blister pack, finished product, GMP certified',
    quantity: 200000,
    unitPrice: 0.065,
    packSize: 10,
    packPrice: 0.65,
    currency: 'USD',
    status: 'po_submitted',
    selectedSupplier: 'Sun Pharmaceutical',
    supplierOrgId: 'sup-sun',
    incoterm: 'FOB',
    incotermLocation: 'Casablanca',
    shipToCity: 'Lagos',
    shipToCountry: 'Nigeria',
    shipToAddress: 'Apapa Wharf, Bonded Warehouse 7, Lagos, Nigeria',
    cycleName: 'Cycle 253',
    cycleId: 'cycle-253',
    buyerPoNumber: 'FMOH-NG-2026-0216',
  },
  {
    id: 'oi-006',
    orderNumber: 'ORD-253-006',
    buyerName: 'Ghana Health Service',
    productName: 'Omeprazole 20mg Capsules',
    description: '28 caps/blister pack, enteric-coated, GMP certified',
    quantity: 150000,
    unitPrice: 0.055,
    packSize: 28,
    packPrice: 1.54,
    currency: 'USD',
    status: 'po_submitted',
    selectedSupplier: 'Aurobindo Pharma',
    supplierOrgId: 'sup-aurobindo',
    incoterm: 'CIF',
    incotermLocation: 'Accra',
    shipToCity: 'Accra',
    shipToCountry: 'Ghana',
    shipToAddress: 'Tema Port Free Zone, Warehouse 14, Accra, Ghana',
    cycleName: 'Cycle 253',
    cycleId: 'cycle-253',
    buyerPoNumber: 'GHS-2026-0091',
  },
  {
    id: 'oi-007',
    orderNumber: 'ORD-253-007',
    buyerName: 'Kenya Medical Supplies Authority',
    productName: 'Azithromycin 250mg Tablets',
    description: '6 tabs/blister pack, finished product, WHO prequalified',
    quantity: 120000,
    unitPrice: 0.18,
    packSize: 6,
    packPrice: 1.08,
    currency: 'USD',
    status: 'quotation_selected',
    selectedSupplier: 'Cipla Ltd',
    supplierOrgId: 'sup-cipla',
    incoterm: 'FCA',
    incotermLocation: 'Mumbai',
    shipToCity: 'Nairobi',
    shipToCountry: 'Kenya',
    shipToAddress: 'KEMSA Central Warehouse, Commercial Street, Nairobi, Kenya',
    cycleName: 'Cycle 253',
    cycleId: 'cycle-253',
    buyerPoNumber: '',
  },
  {
    id: 'oi-008',
    orderNumber: 'ORD-253-008',
    buyerName: 'Nigeria Federal Ministry of Health',
    productName: 'Losartan 50mg Tablets',
    description: '30 tabs/bottle, finished product, GMP certified',
    quantity: 250000,
    unitPrice: 0.038,
    packSize: 30,
    packPrice: 1.14,
    currency: 'USD',
    status: 'quotation_selected',
    selectedSupplier: 'Sun Pharmaceutical',
    supplierOrgId: 'sup-sun',
    incoterm: 'FOB',
    incotermLocation: 'Casablanca',
    shipToCity: 'Lagos',
    shipToCountry: 'Nigeria',
    shipToAddress: 'Apapa Wharf, Bonded Warehouse 7, Lagos, Nigeria',
    cycleName: 'Cycle 253',
    cycleId: 'cycle-253',
    buyerPoNumber: '',
  },
  {
    id: 'oi-009',
    orderNumber: 'ORD-253-009',
    buyerName: 'Ghana Health Service',
    productName: 'Atenolol 50mg Tablets',
    description: '28 tabs/blister pack, finished product, WHO prequalified',
    quantity: 180000,
    unitPrice: 0.022,
    packSize: 28,
    packPrice: 0.616,
    currency: 'USD',
    status: 'po_submitted',
    selectedSupplier: 'Novartis AG',
    supplierOrgId: 'sup-novartis',
    incoterm: 'EXW',
    incotermLocation: 'Leverkusen',
    shipToCity: 'Accra',
    shipToCountry: 'Ghana',
    shipToAddress: 'Tema Port Free Zone, Warehouse 14, Accra, Ghana',
    cycleName: 'Cycle 253',
    cycleId: 'cycle-253',
    buyerPoNumber: 'GHS-2026-0092',
  },
  {
    id: 'oi-010',
    orderNumber: 'ORD-253-010',
    buyerName: 'Kenya Medical Supplies Authority',
    productName: 'Ibuprofen 400mg Tablets',
    description: '100 tabs/bottle, finished product, GMP certified',
    quantity: 400000,
    unitPrice: 0.015,
    packSize: 100,
    packPrice: 1.5,
    currency: 'USD',
    status: 'po_submitted',
    selectedSupplier: 'Aurobindo Pharma',
    supplierOrgId: 'sup-aurobindo',
    incoterm: 'CIF',
    incotermLocation: 'Mombasa',
    shipToCity: 'Nairobi',
    shipToCountry: 'Kenya',
    shipToAddress: 'KEMSA Central Warehouse, Commercial Street, Nairobi, Kenya',
    cycleName: 'Cycle 253',
    cycleId: 'cycle-253',
    buyerPoNumber: 'KEMSA-2026-0342',
  },

  // --- Cycle 252 (5 items) ---
  {
    id: 'oi-011',
    orderNumber: 'ORD-252-001',
    buyerName: 'Ghana Health Service',
    productName: 'Doxycycline 100mg Capsules',
    description: '100 caps/bottle, finished product, WHO prequalified',
    quantity: 600000,
    unitPrice: 0.028,
    packSize: 100,
    packPrice: 2.8,
    currency: 'USD',
    status: 'po_submitted',
    selectedSupplier: 'Cipla Ltd',
    supplierOrgId: 'sup-cipla',
    incoterm: 'FCA',
    incotermLocation: 'Mumbai',
    shipToCity: 'Accra',
    shipToCountry: 'Ghana',
    shipToAddress: 'Tema Port Free Zone, Warehouse 14, Accra, Ghana',
    cycleName: 'Cycle 252',
    cycleId: 'cycle-252',
    buyerPoNumber: 'GHS-2026-0078',
  },
  {
    id: 'oi-012',
    orderNumber: 'ORD-252-002',
    buyerName: 'Kenya Medical Supplies Authority',
    productName: 'Amlodipine 5mg Tablets',
    description: '30 tabs/blister pack, finished product, GMP certified',
    quantity: 350000,
    unitPrice: 0.019,
    packSize: 30,
    packPrice: 0.57,
    currency: 'USD',
    status: 'po_submitted',
    selectedSupplier: 'Sun Pharmaceutical',
    supplierOrgId: 'sup-sun',
    incoterm: 'FOB',
    incotermLocation: 'Casablanca',
    shipToCity: 'Nairobi',
    shipToCountry: 'Kenya',
    shipToAddress: 'KEMSA Central Warehouse, Commercial Street, Nairobi, Kenya',
    cycleName: 'Cycle 252',
    cycleId: 'cycle-252',
    buyerPoNumber: 'KEMSA-2026-0298',
  },
  {
    id: 'oi-013',
    orderNumber: 'ORD-252-003',
    buyerName: 'Nigeria Federal Ministry of Health',
    productName: 'Sulfadoxine/Pyrimethamine 500/25mg Tablets',
    description: '3 tabs/blister pack, antimalarial, WHO prequalified',
    quantity: 900000,
    unitPrice: 0.085,
    packSize: 3,
    packPrice: 0.255,
    currency: 'USD',
    status: 'po_submitted',
    selectedSupplier: 'Novartis AG',
    supplierOrgId: 'sup-novartis',
    incoterm: 'EXW',
    incotermLocation: 'Leverkusen',
    shipToCity: 'Lagos',
    shipToCountry: 'Nigeria',
    shipToAddress: 'Apapa Wharf, Bonded Warehouse 7, Lagos, Nigeria',
    cycleName: 'Cycle 252',
    cycleId: 'cycle-252',
    buyerPoNumber: 'FMOH-NG-2026-0189',
  },
  {
    id: 'oi-014',
    orderNumber: 'ORD-252-004',
    buyerName: 'Ghana Health Service',
    productName: 'Cetirizine 10mg Tablets',
    description: '30 tabs/blister pack, antihistamine, GMP certified',
    quantity: 200000,
    unitPrice: 0.014,
    packSize: 30,
    packPrice: 0.42,
    currency: 'USD',
    status: 'quotation_selected',
    selectedSupplier: 'Aurobindo Pharma',
    supplierOrgId: 'sup-aurobindo',
    incoterm: 'CIF',
    incotermLocation: 'Accra',
    shipToCity: 'Accra',
    shipToCountry: 'Ghana',
    shipToAddress: 'Tema Port Free Zone, Warehouse 14, Accra, Ghana',
    cycleName: 'Cycle 252',
    cycleId: 'cycle-252',
    buyerPoNumber: '',
  },
  {
    id: 'oi-015',
    orderNumber: 'ORD-252-005',
    buyerName: 'Kenya Medical Supplies Authority',
    productName: 'Fluconazole 150mg Capsules',
    description: '1 cap/blister pack, antifungal, WHO prequalified',
    quantity: 100000,
    unitPrice: 0.22,
    packSize: 1,
    packPrice: 0.22,
    currency: 'USD',
    status: 'po_submitted',
    selectedSupplier: 'Cipla Ltd',
    supplierOrgId: 'sup-cipla',
    incoterm: 'FCA',
    incotermLocation: 'Mumbai',
    shipToCity: 'Nairobi',
    shipToCountry: 'Kenya',
    shipToAddress: 'KEMSA Central Warehouse, Commercial Street, Nairobi, Kenya',
    cycleName: 'Cycle 252',
    cycleId: 'cycle-252',
    buyerPoNumber: 'KEMSA-2026-0299',
  },
];

// -----------------------------------------------------------------------------
// Purchase Orders (Finance Page)
// -----------------------------------------------------------------------------

export const purchaseOrders: PurchaseOrder[] = [
  // --- Drafts (3) ---
  {
    id: 'po-draft-001',
    poNumber: 'DRAFT-001',
    supplier: 'Cipla Ltd',
    cycleName: 'Cycle 253',
    cycleId: 'cycle-253',
    status: 'draft',
    totalAmount: 30500.0,
    currency: 'USD',
    createdAt: '2026-02-10T09:00:00Z',
    updatedAt: '2026-02-10T09:00:00Z',
    legalEntity: 'Axmed West Africa Ltd',
    legalEntityAbbrev: 'WA',
    vendorAddress:
      'Cipla House, Peninsula Business Park, Ganpatrao Kadam Marg, Mumbai, India',
    vendorContact: 'Rajesh Sharma',
    vendorEmail: 'rajesh.sharma@cipla.com',
    billToEntity: 'Axmed West Africa Ltd',
    billToAddress: '12 Independence Avenue, Accra, Ghana',
    shipToName: 'Ghana Health Service - Central Medical Stores',
    shipToAddress: 'Tema Port Free Zone, Warehouse 14',
    shipToCity: 'Accra',
    shipToCountry: 'Ghana',
    terms: 'Net 60 days',
    referenceNumber: 'REF-253-CIPLA-GH',
    date: '2026-02-10',
    incoterm: 'FCA Mumbai',
    vatPercent: 0,
    lineItems: [
      {
        id: 'li-d001-1',
        product: 'Amoxicillin 500mg Capsules',
        description: '100 caps/bottle, finished product, WHO prequalified',
        quantity: 500000,
        unitPrice: 0.032,
        packSize: 100,
        packPrice: 3.2,
        amount: 16000.0,
      },
      {
        id: 'li-d001-2',
        product: 'Metformin 850mg Tablets',
        description: '60 tabs/blister pack, finished product, GMP certified',
        quantity: 300000,
        unitPrice: 0.045,
        packSize: 60,
        packPrice: 2.7,
        amount: 13500.0,
      },
      {
        id: 'li-d001-3',
        product: 'Doxycycline 100mg Capsules',
        description: '100 caps/bottle, finished product, WHO prequalified',
        quantity: 25000,
        unitPrice: 0.04,
        packSize: 100,
        packPrice: 4.0,
        amount: 1000.0,
      },
    ],
  },
  {
    id: 'po-draft-002',
    poNumber: 'DRAFT-002',
    supplier: 'Aurobindo Pharma',
    cycleName: 'Cycle 253',
    cycleId: 'cycle-253',
    status: 'draft',
    totalAmount: 14250.0,
    currency: 'USD',
    createdAt: '2026-02-10T10:30:00Z',
    updatedAt: '2026-02-10T10:30:00Z',
    legalEntity: 'Axmed East Africa Ltd',
    legalEntityAbbrev: 'EA',
    vendorAddress: 'Plot No. 2, Maitrivihar, Ameerpet, Hyderabad, India',
    vendorContact: 'Vikram Reddy',
    vendorEmail: 'vikram.reddy@aurobindo.com',
    billToEntity: 'Axmed East Africa Ltd',
    billToAddress: '45 Kenyatta Avenue, Nairobi, Kenya',
    shipToName: 'KEMSA Central Warehouse',
    shipToAddress: 'Commercial Street, Industrial Area',
    shipToCity: 'Nairobi',
    shipToCountry: 'Kenya',
    terms: 'Net 45 days',
    referenceNumber: 'REF-253-AURO-KE',
    date: '2026-02-10',
    incoterm: 'CIF Mombasa',
    vatPercent: 0,
    lineItems: [
      {
        id: 'li-d002-1',
        product: 'Paracetamol 500mg Tablets',
        description: '1000 tabs/bottle, finished product, WHO prequalified',
        quantity: 1000000,
        unitPrice: 0.008,
        packSize: 1000,
        packPrice: 8.0,
        amount: 8000.0,
      },
      {
        id: 'li-d002-2',
        product: 'Ibuprofen 400mg Tablets',
        description: '100 tabs/bottle, finished product, GMP certified',
        quantity: 400000,
        unitPrice: 0.015,
        packSize: 100,
        packPrice: 1.5,
        amount: 6000.0,
      },
      {
        id: 'li-d002-3',
        product: 'Omeprazole 20mg Capsules',
        description: '28 caps/blister pack, enteric-coated, GMP certified',
        quantity: 5000,
        unitPrice: 0.05,
        packSize: 28,
        packPrice: 1.4,
        amount: 250.0,
      },
    ],
  },
  {
    id: 'po-draft-003',
    poNumber: 'DRAFT-003',
    supplier: 'Sun Pharmaceutical',
    cycleName: 'Cycle 253',
    cycleId: 'cycle-253',
    status: 'draft',
    totalAmount: 19650.0,
    currency: 'USD',
    createdAt: '2026-02-10T11:00:00Z',
    updatedAt: '2026-02-10T11:00:00Z',
    legalEntity: 'Axmed West Africa Ltd',
    legalEntityAbbrev: 'WA',
    vendorAddress:
      'Sun House, Plot No. 201 B/1, Western Express Highway, Goregaon East, Mumbai, India',
    vendorContact: 'Amit Patel',
    vendorEmail: 'amit.patel@sunpharma.com',
    billToEntity: 'Axmed West Africa Ltd',
    billToAddress: '12 Independence Avenue, Accra, Ghana',
    shipToName: 'Nigeria Federal Medical Warehouse',
    shipToAddress: 'Apapa Wharf, Bonded Warehouse 7',
    shipToCity: 'Lagos',
    shipToCountry: 'Nigeria',
    terms: 'Net 30 days',
    referenceNumber: 'REF-253-SUN-NG',
    date: '2026-02-10',
    incoterm: 'FOB Casablanca',
    vatPercent: 0,
    lineItems: [
      {
        id: 'li-d003-1',
        product: 'Ciprofloxacin 500mg Tablets',
        description: '10 tabs/blister pack, finished product, GMP certified',
        quantity: 200000,
        unitPrice: 0.065,
        packSize: 10,
        packPrice: 0.65,
        amount: 13000.0,
      },
      {
        id: 'li-d003-2',
        product: 'Amlodipine 5mg Tablets',
        description: '30 tabs/blister pack, finished product, GMP certified',
        quantity: 350000,
        unitPrice: 0.019,
        packSize: 30,
        packPrice: 0.57,
        amount: 6650.0,
      },
    ],
  },

  // --- Cleared by Commercial (2) ---
  {
    id: 'po-clr-001',
    poNumber: 'PO/WA/2026-0210/001',
    supplier: 'Novartis AG',
    cycleName: 'Cycle 253',
    cycleId: 'cycle-253',
    status: 'cleared_by_commercial',
    totalAmount: 99960.0,
    currency: 'USD',
    createdAt: '2026-02-08T14:00:00Z',
    updatedAt: '2026-02-09T10:00:00Z',
    legalEntity: 'Axmed West Africa Ltd',
    legalEntityAbbrev: 'WA',
    vendorAddress: 'Lichtstrasse 35, 4056 Basel, Switzerland',
    vendorContact: 'Stefan Mueller',
    vendorEmail: 'stefan.mueller@novartis.com',
    billToEntity: 'Axmed West Africa Ltd',
    billToAddress: '12 Independence Avenue, Accra, Ghana',
    shipToName: 'Nigeria Federal Medical Warehouse',
    shipToAddress: 'Apapa Wharf, Bonded Warehouse 7',
    shipToCity: 'Lagos',
    shipToCountry: 'Nigeria',
    terms: 'Net 60 days',
    referenceNumber: 'REF-253-NOV-NG',
    date: '2026-02-08',
    incoterm: 'EXW Leverkusen',
    vatPercent: 0,
    lineItems: [
      {
        id: 'li-c001-1',
        product: 'Artemether/Lumefantrine 20/120mg Tablets',
        description:
          '24 tabs/blister pack, antimalarial combination, WHO prequalified',
        quantity: 800000,
        unitPrice: 0.12,
        packSize: 24,
        packPrice: 2.88,
        amount: 96000.0,
      },
      {
        id: 'li-c001-2',
        product: 'Atenolol 50mg Tablets',
        description: '28 tabs/blister pack, finished product, WHO prequalified',
        quantity: 180000,
        unitPrice: 0.022,
        packSize: 28,
        packPrice: 0.616,
        amount: 3960.0,
      },
    ],
  },
  {
    id: 'po-clr-002',
    poNumber: 'PO/EA/2026-0210/002',
    supplier: 'Cipla Ltd',
    cycleName: 'Cycle 252',
    cycleId: 'cycle-252',
    status: 'cleared_by_commercial',
    totalAmount: 38800.0,
    currency: 'USD',
    createdAt: '2026-02-07T09:00:00Z',
    updatedAt: '2026-02-09T16:00:00Z',
    legalEntity: 'Axmed East Africa Ltd',
    legalEntityAbbrev: 'EA',
    vendorAddress:
      'Cipla House, Peninsula Business Park, Ganpatrao Kadam Marg, Mumbai, India',
    vendorContact: 'Rajesh Sharma',
    vendorEmail: 'rajesh.sharma@cipla.com',
    billToEntity: 'Axmed East Africa Ltd',
    billToAddress: '45 Kenyatta Avenue, Nairobi, Kenya',
    shipToName: 'KEMSA Central Warehouse',
    shipToAddress: 'Commercial Street, Industrial Area',
    shipToCity: 'Nairobi',
    shipToCountry: 'Kenya',
    terms: 'Net 45 days',
    referenceNumber: 'REF-252-CIPLA-KE',
    date: '2026-02-07',
    incoterm: 'FCA Mumbai',
    vatPercent: 0,
    lineItems: [
      {
        id: 'li-c002-1',
        product: 'Doxycycline 100mg Capsules',
        description: '100 caps/bottle, finished product, WHO prequalified',
        quantity: 600000,
        unitPrice: 0.028,
        packSize: 100,
        packPrice: 2.8,
        amount: 16800.0,
      },
      {
        id: 'li-c002-2',
        product: 'Fluconazole 150mg Capsules',
        description: '1 cap/blister pack, antifungal, WHO prequalified',
        quantity: 100000,
        unitPrice: 0.22,
        packSize: 1,
        packPrice: 0.22,
        amount: 22000.0,
      },
    ],
  },

  // --- Submitted (3) ---
  {
    id: 'po-sub-001',
    poNumber: 'PO/WA/2026-0203/001',
    supplier: 'Cipla Ltd',
    cycleName: 'Cycle 252',
    cycleId: 'cycle-252',
    status: 'submitted',
    totalAmount: 52400.0,
    currency: 'USD',
    createdAt: '2026-02-01T08:00:00Z',
    updatedAt: '2026-02-03T12:00:00Z',
    legalEntity: 'Axmed West Africa Ltd',
    legalEntityAbbrev: 'WA',
    vendorAddress:
      'Cipla House, Peninsula Business Park, Ganpatrao Kadam Marg, Mumbai, India',
    vendorContact: 'Rajesh Sharma',
    vendorEmail: 'rajesh.sharma@cipla.com',
    billToEntity: 'Axmed West Africa Ltd',
    billToAddress: '12 Independence Avenue, Accra, Ghana',
    shipToName: 'Ghana Health Service - Central Medical Stores',
    shipToAddress: 'Tema Port Free Zone, Warehouse 14',
    shipToCity: 'Accra',
    shipToCountry: 'Ghana',
    terms: 'Net 60 days',
    referenceNumber: 'REF-252-CIPLA-GH-01',
    date: '2026-02-03',
    incoterm: 'FCA Mumbai',
    vatPercent: 0,
    lineItems: [
      {
        id: 'li-s001-1',
        product: 'Amoxicillin 500mg Capsules',
        description: '100 caps/bottle, finished product, WHO prequalified',
        quantity: 750000,
        unitPrice: 0.032,
        packSize: 100,
        packPrice: 3.2,
        amount: 24000.0,
      },
      {
        id: 'li-s001-2',
        product: 'Metformin 850mg Tablets',
        description: '60 tabs/blister pack, finished product, GMP certified',
        quantity: 500000,
        unitPrice: 0.045,
        packSize: 60,
        packPrice: 2.7,
        amount: 22500.0,
      },
      {
        id: 'li-s001-3',
        product: 'Azithromycin 250mg Tablets',
        description: '6 tabs/blister pack, finished product, WHO prequalified',
        quantity: 32778,
        unitPrice: 0.18,
        packSize: 6,
        packPrice: 1.08,
        amount: 5900.04,
      },
    ],
  },
  {
    id: 'po-sub-002',
    poNumber: 'PO/WA/2026-0203/002',
    supplier: 'Novartis AG',
    cycleName: 'Cycle 252',
    cycleId: 'cycle-252',
    status: 'submitted',
    totalAmount: 76500.0,
    currency: 'USD',
    createdAt: '2026-02-01T08:00:00Z',
    updatedAt: '2026-02-03T14:00:00Z',
    legalEntity: 'Axmed West Africa Ltd',
    legalEntityAbbrev: 'WA',
    vendorAddress: 'Lichtstrasse 35, 4056 Basel, Switzerland',
    vendorContact: 'Stefan Mueller',
    vendorEmail: 'stefan.mueller@novartis.com',
    billToEntity: 'Axmed West Africa Ltd',
    billToAddress: '12 Independence Avenue, Accra, Ghana',
    shipToName: 'Nigeria Federal Medical Warehouse',
    shipToAddress: 'Apapa Wharf, Bonded Warehouse 7',
    shipToCity: 'Lagos',
    shipToCountry: 'Nigeria',
    terms: 'Letter of Credit 60 days',
    referenceNumber: 'REF-252-NOV-NG-01',
    date: '2026-02-03',
    incoterm: 'EXW Leverkusen',
    vatPercent: 0,
    lineItems: [
      {
        id: 'li-s002-1',
        product: 'Sulfadoxine/Pyrimethamine 500/25mg Tablets',
        description: '3 tabs/blister pack, antimalarial, WHO prequalified',
        quantity: 900000,
        unitPrice: 0.085,
        packSize: 3,
        packPrice: 0.255,
        amount: 76500.0,
      },
    ],
  },
  {
    id: 'po-sub-003',
    poNumber: 'PO/EA/2026-0205/001',
    supplier: 'Aurobindo Pharma',
    cycleName: 'Cycle 252',
    cycleId: 'cycle-252',
    status: 'submitted',
    totalAmount: 18750.0,
    currency: 'USD',
    createdAt: '2026-02-03T08:00:00Z',
    updatedAt: '2026-02-05T09:30:00Z',
    legalEntity: 'Axmed East Africa Ltd',
    legalEntityAbbrev: 'EA',
    vendorAddress: 'Plot No. 2, Maitrivihar, Ameerpet, Hyderabad, India',
    vendorContact: 'Vikram Reddy',
    vendorEmail: 'vikram.reddy@aurobindo.com',
    billToEntity: 'Axmed East Africa Ltd',
    billToAddress: '45 Kenyatta Avenue, Nairobi, Kenya',
    shipToName: 'KEMSA Central Warehouse',
    shipToAddress: 'Commercial Street, Industrial Area',
    shipToCity: 'Nairobi',
    shipToCountry: 'Kenya',
    terms: 'Net 45 days',
    referenceNumber: 'REF-252-AURO-KE-01',
    date: '2026-02-05',
    incoterm: 'CIF Mombasa',
    vatPercent: 0,
    lineItems: [
      {
        id: 'li-s003-1',
        product: 'Paracetamol 500mg Tablets',
        description: '1000 tabs/bottle, finished product, WHO prequalified',
        quantity: 1500000,
        unitPrice: 0.008,
        packSize: 1000,
        packPrice: 8.0,
        amount: 12000.0,
      },
      {
        id: 'li-s003-2',
        product: 'Ibuprofen 400mg Tablets',
        description: '100 tabs/bottle, finished product, GMP certified',
        quantity: 450000,
        unitPrice: 0.015,
        packSize: 100,
        packPrice: 1.5,
        amount: 6750.0,
      },
    ],
  },

  // --- Confirmed (1) ---
  {
    id: 'po-conf-001',
    poNumber: 'PO/WA/2026-0128/001',
    supplier: 'Cipla Ltd',
    cycleName: 'Cycle 251',
    cycleId: 'cycle-251',
    status: 'confirmed',
    totalAmount: 44800.0,
    currency: 'USD',
    createdAt: '2026-01-25T08:00:00Z',
    updatedAt: '2026-01-28T16:00:00Z',
    legalEntity: 'Axmed West Africa Ltd',
    legalEntityAbbrev: 'WA',
    vendorAddress:
      'Cipla House, Peninsula Business Park, Ganpatrao Kadam Marg, Mumbai, India',
    vendorContact: 'Rajesh Sharma',
    vendorEmail: 'rajesh.sharma@cipla.com',
    billToEntity: 'Axmed West Africa Ltd',
    billToAddress: '12 Independence Avenue, Accra, Ghana',
    shipToName: 'Ghana Health Service - Central Medical Stores',
    shipToAddress: 'Tema Port Free Zone, Warehouse 14',
    shipToCity: 'Accra',
    shipToCountry: 'Ghana',
    terms: 'Net 60 days',
    referenceNumber: 'REF-251-CIPLA-GH-01',
    date: '2026-01-28',
    incoterm: 'FCA Mumbai',
    vatPercent: 0,
    lineItems: [
      {
        id: 'li-cf001-1',
        product: 'Amoxicillin 500mg Capsules',
        description: '100 caps/bottle, finished product, WHO prequalified',
        quantity: 1000000,
        unitPrice: 0.032,
        packSize: 100,
        packPrice: 3.2,
        amount: 32000.0,
      },
      {
        id: 'li-cf001-2',
        product: 'Doxycycline 100mg Capsules',
        description: '100 caps/bottle, finished product, WHO prequalified',
        quantity: 200000,
        unitPrice: 0.028,
        packSize: 100,
        packPrice: 2.8,
        amount: 5600.0,
      },
      {
        id: 'li-cf001-3',
        product: 'Fluconazole 150mg Capsules',
        description: '1 cap/blister pack, antifungal, WHO prequalified',
        quantity: 32727,
        unitPrice: 0.22,
        packSize: 1,
        packPrice: 0.22,
        amount: 7199.94,
      },
    ],
  },

  // --- Partially Confirmed (1) ---
  {
    id: 'po-pconf-001',
    poNumber: 'PO/EA/2026-0130/001',
    supplier: 'Sun Pharmaceutical',
    cycleName: 'Cycle 251',
    cycleId: 'cycle-251',
    status: 'partially_confirmed',
    totalAmount: 28400.0,
    currency: 'USD',
    createdAt: '2026-01-27T08:00:00Z',
    updatedAt: '2026-01-30T11:00:00Z',
    legalEntity: 'Axmed East Africa Ltd',
    legalEntityAbbrev: 'EA',
    vendorAddress:
      'Sun House, Plot No. 201 B/1, Western Express Highway, Goregaon East, Mumbai, India',
    vendorContact: 'Amit Patel',
    vendorEmail: 'amit.patel@sunpharma.com',
    billToEntity: 'Axmed East Africa Ltd',
    billToAddress: '45 Kenyatta Avenue, Nairobi, Kenya',
    shipToName: 'KEMSA Central Warehouse',
    shipToAddress: 'Commercial Street, Industrial Area',
    shipToCity: 'Nairobi',
    shipToCountry: 'Kenya',
    terms: 'Net 30 days',
    referenceNumber: 'REF-251-SUN-KE-01',
    date: '2026-01-30',
    incoterm: 'FOB Casablanca',
    vatPercent: 0,
    lineItems: [
      {
        id: 'li-pc001-1',
        product: 'Ciprofloxacin 500mg Tablets',
        description: '10 tabs/blister pack, finished product, GMP certified',
        quantity: 300000,
        unitPrice: 0.065,
        packSize: 10,
        packPrice: 0.65,
        amount: 19500.0,
      },
      {
        id: 'li-pc001-2',
        product: 'Amlodipine 5mg Tablets',
        description: '30 tabs/blister pack, finished product, GMP certified',
        quantity: 250000,
        unitPrice: 0.019,
        packSize: 30,
        packPrice: 0.57,
        amount: 4750.0,
      },
      {
        id: 'li-pc001-3',
        product: 'Losartan 50mg Tablets',
        description: '30 tabs/bottle, finished product, GMP certified',
        quantity: 109210,
        unitPrice: 0.038,
        packSize: 30,
        packPrice: 1.14,
        amount: 4149.98,
      },
    ],
  },
];

// -----------------------------------------------------------------------------
// Supplier Awards (Awards Tab - Novartis AG perspective)
// -----------------------------------------------------------------------------

export const supplierAwards: SupplierAward[] = [
  {
    id: 'award-001',
    skuName: 'Artemether/Lumefantrine 20/120mg Tablets',
    description:
      '24 tabs/blister pack, antimalarial combination, WHO prequalified',
    totalQuantity: 2000000,
    unitPrice: 0.12,
    currency: 'USD',
    status: 'confirmed',
    plannedShipments: [
      {
        poNumber: 'PO/WA/2026-0203/002',
        location: 'Lagos, Nigeria',
        quantity: 800000,
        totalQuantity: 2000000,
        percentage: 40,
      },
      {
        poNumber: 'PO/WA/2026-0210/001',
        location: 'Accra, Ghana',
        quantity: 700000,
        totalQuantity: 2000000,
        percentage: 35,
      },
      {
        poNumber: 'PO/EA/2026-0215/001',
        location: 'Nairobi, Kenya',
        quantity: 500000,
        totalQuantity: 2000000,
        percentage: 25,
      },
    ],
    technicalEnrichment: {
      dangerousGoods: false,
      storageTemp: 'Below 30C, protect from moisture',
      shelfLife: '36 months',
      batchNumber: 'ALT-2026-B001',
    },
  },
  {
    id: 'award-002',
    skuName: 'Atenolol 50mg Tablets',
    description: '28 tabs/blister pack, finished product, WHO prequalified',
    totalQuantity: 500000,
    unitPrice: 0.022,
    currency: 'USD',
    status: 'confirmed',
    plannedShipments: [
      {
        poNumber: 'PO/WA/2026-0210/001',
        location: 'Accra, Ghana',
        quantity: 180000,
        totalQuantity: 500000,
        percentage: 36,
      },
      {
        poNumber: 'PO/EA/2026-0215/002',
        location: 'Nairobi, Kenya',
        quantity: 200000,
        totalQuantity: 500000,
        percentage: 40,
      },
      {
        poNumber: 'PO/WA/2026-0218/001',
        location: 'Lagos, Nigeria',
        quantity: 120000,
        totalQuantity: 500000,
        percentage: 24,
      },
    ],
    technicalEnrichment: {
      dangerousGoods: false,
      storageTemp: 'Below 25C, protect from light',
      shelfLife: '24 months',
      batchNumber: 'ATN-2026-B003',
    },
  },
  {
    id: 'award-003',
    skuName: 'Sulfadoxine/Pyrimethamine 500/25mg Tablets',
    description: '3 tabs/blister pack, antimalarial, WHO prequalified',
    totalQuantity: 1500000,
    unitPrice: 0.085,
    currency: 'USD',
    status: 'pending_confirmation',
    plannedShipments: [
      {
        poNumber: 'PO/WA/2026-0203/002',
        location: 'Lagos, Nigeria',
        quantity: 900000,
        totalQuantity: 1500000,
        percentage: 60,
      },
      {
        poNumber: 'PO/WA/2026-0220/001',
        location: 'Accra, Ghana',
        quantity: 600000,
        totalQuantity: 1500000,
        percentage: 40,
      },
    ],
    technicalEnrichment: {
      dangerousGoods: false,
      storageTemp: 'Below 30C',
      shelfLife: '36 months',
      batchNumber: 'SP-2026-B007',
    },
  },
  {
    id: 'award-004',
    skuName: 'Diazepam 5mg Tablets',
    description: '10 tabs/blister pack, controlled substance, WHO prequalified',
    totalQuantity: 300000,
    unitPrice: 0.035,
    currency: 'USD',
    status: 'partially_confirmed',
    plannedShipments: [
      {
        poNumber: 'PO/WA/2026-0220/002',
        location: 'Lagos, Nigeria',
        quantity: 150000,
        totalQuantity: 300000,
        percentage: 50,
      },
      {
        poNumber: 'PO/EA/2026-0222/001',
        location: 'Nairobi, Kenya',
        quantity: 100000,
        totalQuantity: 300000,
        percentage: 33,
      },
      {
        poNumber: 'PO/WA/2026-0225/001',
        location: 'Accra, Ghana',
        quantity: 50000,
        totalQuantity: 300000,
        percentage: 17,
      },
    ],
    technicalEnrichment: {
      dangerousGoods: false,
      storageTemp: 'Below 25C, protect from light',
      shelfLife: '24 months',
      batchNumber: 'DZP-2026-B002',
    },
  },
  {
    id: 'award-005',
    skuName: 'Nifedipine 20mg Retard Tablets',
    description: '28 tabs/blister pack, sustained release, GMP certified',
    totalQuantity: 400000,
    unitPrice: 0.048,
    currency: 'USD',
    status: 'pending_confirmation',
    plannedShipments: [
      {
        poNumber: 'PO/EA/2026-0225/002',
        location: 'Nairobi, Kenya',
        quantity: 250000,
        totalQuantity: 400000,
        percentage: 62.5,
      },
      {
        poNumber: 'PO/WA/2026-0225/003',
        location: 'Accra, Ghana',
        quantity: 150000,
        totalQuantity: 400000,
        percentage: 37.5,
      },
    ],
    technicalEnrichment: {
      dangerousGoods: false,
      storageTemp: 'Below 25C, protect from light and moisture',
      shelfLife: '30 months',
      batchNumber: 'NFD-2026-B001',
    },
  },
  {
    id: 'award-006',
    skuName: 'Carbamazepine 200mg Tablets',
    description: '100 tabs/bottle, antiepileptic, WHO prequalified',
    totalQuantity: 250000,
    unitPrice: 0.042,
    currency: 'USD',
    status: 'confirmed',
    plannedShipments: [
      {
        poNumber: 'PO/WA/2026-0210/003',
        location: 'Lagos, Nigeria',
        quantity: 150000,
        totalQuantity: 250000,
        percentage: 60,
      },
      {
        poNumber: 'PO/EA/2026-0215/003',
        location: 'Nairobi, Kenya',
        quantity: 100000,
        totalQuantity: 250000,
        percentage: 40,
      },
    ],
    technicalEnrichment: {
      dangerousGoods: false,
      storageTemp: 'Below 25C, protect from moisture',
      shelfLife: '36 months',
      batchNumber: 'CBZ-2026-B004',
    },
  },
  {
    id: 'award-007',
    skuName: 'Prednisone 5mg Tablets',
    description: '100 tabs/bottle, corticosteroid, GMP certified',
    totalQuantity: 200000,
    unitPrice: 0.025,
    currency: 'USD',
    status: 'withdrawn',
    plannedShipments: [
      {
        poNumber: '',
        location: 'Accra, Ghana',
        quantity: 120000,
        totalQuantity: 200000,
        percentage: 60,
      },
      {
        poNumber: '',
        location: 'Nairobi, Kenya',
        quantity: 80000,
        totalQuantity: 200000,
        percentage: 40,
      },
    ],
  },
  {
    id: 'award-008',
    skuName: 'Metoclopramide 10mg Tablets',
    description: '100 tabs/bottle, antiemetic, GMP certified',
    totalQuantity: 350000,
    unitPrice: 0.018,
    currency: 'USD',
    status: 'pending_confirmation',
    plannedShipments: [
      {
        poNumber: 'PO/WA/2026-0228/001',
        location: 'Lagos, Nigeria',
        quantity: 200000,
        totalQuantity: 350000,
        percentage: 57,
      },
      {
        poNumber: 'PO/WA/2026-0228/002',
        location: 'Accra, Ghana',
        quantity: 150000,
        totalQuantity: 350000,
        percentage: 43,
      },
    ],
    technicalEnrichment: {
      dangerousGoods: false,
      storageTemp: 'Below 30C',
      shelfLife: '24 months',
      batchNumber: 'MTC-2026-B005',
    },
  },
];

// -----------------------------------------------------------------------------
// Fulfillment Data (Confirmed Tab)
// -----------------------------------------------------------------------------

export const fulfillmentLocations: FulfillmentLocation[] = [
  {
    city: 'Casablanca',
    country: 'Morocco',
    newCount: 2,
    purchaseOrders: [
      {
        dateConfirmed: '2026-02-10',
        poNumber: 'PO/WA/2026-0203/002',
        skuCount: 3,
        value: 76500.0,
        currency: 'USD',
        status: 'confirmed',
        incotermSpec: 'FOB Casablanca',
        shipTo: 'Lagos, Nigeria',
        isNew: true,
      },
      {
        dateConfirmed: '2026-02-08',
        poNumber: 'PO/WA/2026-0128/002',
        skuCount: 2,
        value: 34200.0,
        currency: 'USD',
        status: 'ready_for_pickup',
        incotermSpec: 'FOB Casablanca',
        shipTo: 'Accra, Ghana',
        isNew: true,
      },
      {
        dateConfirmed: '2026-01-28',
        poNumber: 'PO/WA/2026-0120/001',
        skuCount: 4,
        value: 52100.0,
        currency: 'USD',
        status: 'collected',
        incotermSpec: 'FOB Casablanca',
        shipTo: 'Lagos, Nigeria',
        isNew: false,
      },
      {
        dateConfirmed: '2026-01-15',
        poNumber: 'PO/WA/2026-0110/001',
        skuCount: 2,
        value: 18900.0,
        currency: 'USD',
        status: 'invoiced',
        incotermSpec: 'FOB Casablanca',
        shipTo: 'Accra, Ghana',
        isNew: false,
      },
    ],
  },
  {
    city: 'Leverkusen',
    country: 'Germany',
    newCount: 1,
    purchaseOrders: [
      {
        dateConfirmed: '2026-02-09',
        poNumber: 'PO/WA/2026-0203/003',
        skuCount: 2,
        value: 99960.0,
        currency: 'USD',
        status: 'confirmed',
        incotermSpec: 'EXW Leverkusen',
        shipTo: 'Lagos, Nigeria',
        isNew: true,
      },
      {
        dateConfirmed: '2026-02-01',
        poNumber: 'PO/WA/2026-0125/001',
        skuCount: 3,
        value: 45600.0,
        currency: 'USD',
        status: 'ready_for_pickup',
        incotermSpec: 'EXW Leverkusen',
        shipTo: 'Lagos, Nigeria',
        isNew: false,
      },
      {
        dateConfirmed: '2026-01-22',
        poNumber: 'PO/EA/2026-0118/001',
        skuCount: 2,
        value: 31200.0,
        currency: 'USD',
        status: 'collected',
        incotermSpec: 'EXW Leverkusen',
        shipTo: 'Nairobi, Kenya',
        isNew: false,
      },
      {
        dateConfirmed: '2026-01-10',
        poNumber: 'PO/WA/2026-0105/001',
        skuCount: 1,
        value: 22400.0,
        currency: 'USD',
        status: 'invoiced',
        incotermSpec: 'EXW Leverkusen',
        shipTo: 'Accra, Ghana',
        isNew: false,
      },
      {
        dateConfirmed: '2026-01-05',
        poNumber: 'PO/EA/2026-0102/001',
        skuCount: 2,
        value: 15800.0,
        currency: 'USD',
        status: 'invoiced',
        incotermSpec: 'EXW Leverkusen',
        shipTo: 'Nairobi, Kenya',
        isNew: false,
      },
    ],
  },
  {
    city: 'Mumbai',
    country: 'India',
    newCount: 1,
    purchaseOrders: [
      {
        dateConfirmed: '2026-02-11',
        poNumber: 'PO/WA/2026-0203/001',
        skuCount: 3,
        value: 52400.0,
        currency: 'USD',
        status: 'confirmed',
        incotermSpec: 'FCA Mumbai',
        shipTo: 'Accra, Ghana',
        isNew: true,
      },
      {
        dateConfirmed: '2026-02-05',
        poNumber: 'PO/EA/2026-0130/001',
        skuCount: 3,
        value: 28400.0,
        currency: 'USD',
        status: 'ready_for_pickup',
        incotermSpec: 'FCA Mumbai',
        shipTo: 'Nairobi, Kenya',
        isNew: false,
      },
      {
        dateConfirmed: '2026-01-20',
        poNumber: 'PO/WA/2026-0115/001',
        skuCount: 2,
        value: 38500.0,
        currency: 'USD',
        status: 'collected',
        incotermSpec: 'FCA Mumbai',
        shipTo: 'Accra, Ghana',
        isNew: false,
      },
    ],
  },
];

// -----------------------------------------------------------------------------
// Helper: Group Order Items into Draft PO Groups
// -----------------------------------------------------------------------------

/**
 * Groups selected order items into draft PO groups by supplier + incoterm + ship-to.
 * Each group represents one draft PO to be created. Items are aggregated by
 * the combination of supplier organization, incoterm, incoterm location,
 * ship-to city, and ship-to country.
 */
export function groupOrderItemsIntoDraftPOs(
  items: OrderItem[]
): DraftPOGroup[] {
  const groupMap = new Map<string, DraftPOGroup>();

  for (const item of items) {
    const key = [
      item.supplierOrgId,
      item.incoterm,
      item.incotermLocation,
      item.shipToCity,
      item.shipToCountry,
    ].join('||');

    if (groupMap.has(key)) {
      const group = groupMap.get(key)!;
      group.items.push(item);
      group.skuCount = group.items.length;
      group.totalValue = group.items.reduce(
        (sum, i) => sum + i.quantity * i.unitPrice,
        0
      );
    } else {
      groupMap.set(key, {
        supplier: item.selectedSupplier,
        supplierOrgId: item.supplierOrgId,
        incoterm: item.incoterm,
        incotermLocation: item.incotermLocation,
        shipToCity: item.shipToCity,
        shipToCountry: item.shipToCountry,
        skuCount: 1,
        items: [item],
        totalValue: item.quantity * item.unitPrice,
      });
    }
  }

  return Array.from(groupMap.values());
}
