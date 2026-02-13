import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import {
  orderItems as initialOrderItems,
  purchaseOrders as initialPurchaseOrders,
  supplierOrganizations,
  legalEntities,
} from '../data/mockData';
import type {
  OrderItem,
  PurchaseOrder,
  POLineItem,
  DraftPOGroup,
  LegalEntity,
} from '../data/mockData';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface POFlowState {
  orderItems: OrderItem[];
  purchaseOrders: PurchaseOrder[];
  nextDraftNumber: number;
}

interface POFlowContextValue extends POFlowState {
  createDraftPOs: (groups: DraftPOGroup[]) => PurchaseOrder[];
  deleteDraftPO: (poId: string) => void;
  updatePOStatus: (poId: string, newStatus: PurchaseOrder['status']) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveLegalEntity(shipToCountry: string): LegalEntity {
  const countryToEntity: Record<string, string> = {
    Ghana: 'le-wa',
    Nigeria: 'le-wa',
    Kenya: 'le-ea',
  };
  const entityId = countryToEntity[shipToCountry] || 'le-pbc';
  return legalEntities.find((e) => e.id === entityId) || legalEntities[0];
}

function convertGroupToPO(
  group: DraftPOGroup,
  counter: number,
): PurchaseOrder {
  const now = new Date().toISOString();
  const today = now.slice(0, 10);
  const padded = String(counter).padStart(3, '0');
  const poId = `po-draft-${padded}`;
  const poNumber = `DRAFT-${padded}`;

  const supplierOrg = supplierOrganizations.find(
    (s) => s.id === group.supplierOrgId,
  );
  const le = resolveLegalEntity(group.shipToCountry);
  const firstItem = group.items[0];

  const lineItems: POLineItem[] = group.items.map((item, idx) => ({
    id: `li-${poId}-${idx + 1}`,
    product: item.productName,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    packSize: item.packSize,
    packPrice: item.packPrice,
    amount: item.quantity * item.unitPrice,
  }));

  const cycleNum = firstItem.cycleId.replace('cycle-', '');
  const supplierShort = group.supplier.split(' ')[0].toUpperCase();
  const countryShort = group.shipToCountry.slice(0, 2).toUpperCase();

  return {
    id: poId,
    poNumber,
    supplier: group.supplier,
    cycleName: firstItem.cycleName,
    cycleId: firstItem.cycleId,
    status: 'draft',
    totalAmount: group.totalValue,
    currency: firstItem.currency,
    createdAt: now,
    updatedAt: now,
    legalEntity: le.name,
    legalEntityAbbrev: le.abbreviation,
    vendorAddress: supplierOrg
      ? `${supplierOrg.address}, ${supplierOrg.city}, ${supplierOrg.country}`
      : 'N/A',
    vendorContact: supplierOrg?.contacts[0]?.name || '',
    vendorEmail: supplierOrg?.contacts[0]?.email || '',
    billToEntity: le.name,
    billToAddress: le.address,
    shipToName: firstItem.buyerName,
    shipToAddress: firstItem.shipToAddress,
    shipToCity: group.shipToCity,
    shipToCountry: group.shipToCountry,
    terms: 'Net 60 on Delivery',
    referenceNumber: `REF-${cycleNum}-${supplierShort}-${countryShort}`,
    date: today,
    incoterm: `${group.incoterm} ${group.incotermLocation}`,
    vatPercent: 0,
    lineItems,
    sourceOrderItemIds: group.items.map((i) => i.id),
  };
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const POFlowContext = createContext<POFlowContextValue | null>(null);

export function usePOFlow(): POFlowContextValue {
  const ctx = useContext(POFlowContext);
  if (!ctx) throw new Error('usePOFlow must be used within POFlowProvider');
  return ctx;
}

export function POFlowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<POFlowState>({
    orderItems: [...initialOrderItems],
    purchaseOrders: initialPurchaseOrders.filter(
      (po) => po.status !== 'draft',
    ),
    nextDraftNumber: 1,
  });

  const createDraftPOs = useCallback(
    (groups: DraftPOGroup[]): PurchaseOrder[] => {
      let counter = state.nextDraftNumber;
      const newPOs: PurchaseOrder[] = [];

      for (const group of groups) {
        newPOs.push(convertGroupToPO(group, counter));
        counter++;
      }

      const usedItemIds = new Set(
        groups.flatMap((g) => g.items.map((i) => i.id)),
      );

      setState((prev) => ({
        orderItems: prev.orderItems.map((oi) =>
          usedItemIds.has(oi.id)
            ? { ...oi, status: 'supplier_yet_to_confirm' as const }
            : oi,
        ),
        purchaseOrders: [...prev.purchaseOrders, ...newPOs],
        nextDraftNumber: counter,
      }));

      return newPOs;
    },
    [state.nextDraftNumber],
  );

  const deleteDraftPO = useCallback((poId: string) => {
    setState((prev) => {
      const poToDelete = prev.purchaseOrders.find((po) => po.id === poId);
      if (!poToDelete || poToDelete.status !== 'draft') return prev;

      const sourceIds = new Set(poToDelete.sourceOrderItemIds || []);

      return {
        ...prev,
        purchaseOrders: prev.purchaseOrders.filter((po) => po.id !== poId),
        orderItems: prev.orderItems.map((oi) =>
          sourceIds.has(oi.id) && oi.status === 'supplier_yet_to_confirm'
            ? { ...oi, status: 'po_submitted' as const }
            : oi,
        ),
      };
    });
  }, []);

  const updatePOStatus = useCallback(
    (poId: string, newStatus: PurchaseOrder['status']) => {
      setState((prev) => ({
        ...prev,
        purchaseOrders: prev.purchaseOrders.map((po) =>
          po.id === poId
            ? { ...po, status: newStatus, updatedAt: new Date().toISOString() }
            : po,
        ),
      }));
    },
    [],
  );

  return (
    <POFlowContext.Provider
      value={{
        ...state,
        createDraftPOs,
        deleteDraftPO,
        updatePOStatus,
      }}
    >
      {children}
    </POFlowContext.Provider>
  );
}
