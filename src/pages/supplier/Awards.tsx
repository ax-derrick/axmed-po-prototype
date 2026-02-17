import { useState, useEffect } from 'react';
import {
  Typography,
  Table,
  Tag,
  Button,
  Drawer,
  Descriptions,
  Radio,
  InputNumber,
  Input,
  Select,
  Steps,
  Divider,
  message,
  Alert,
  Tooltip,
} from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { supplierAwards } from '../../data/mockData';
import type { SupplierAward, PlannedShipment, ConfirmedAllocation } from '../../data/mockData';

const { Title, Text } = Typography;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

type AwardStatus = SupplierAward['status'];
type ConfirmationType = 'full' | 'partial' | 'withdraw';

const statusConfig: Record<AwardStatus, { color: string; label: string }> = {
  pending_confirmation: { color: 'orange', label: 'Pending Confirmation' },
  confirmed: { color: 'green', label: 'Confirmed' },
  partially_confirmed: { color: 'gold', label: 'Partially Confirmed' },
  withdrawn: { color: 'red', label: 'Withdrawn' },
};

interface ComputedSplit {
  poNumber: string;
  location: string;
  originalQty: number;
  percentage: number;
  allocatedQty: number;
}

// ---------------------------------------------------------------------------
// Draft persistence
// ---------------------------------------------------------------------------

interface AwardDraft {
  step: number;
  confirmationType: ConfirmationType;
  confirmedQuantity: number;
  grossWeight: number | null;
  cartonLength: number | null;
  cartonWidth: number | null;
  cartonHeight: number | null;
  packsPerCarton: number | null;
  storageType: string | null;
  isStackable: boolean | null;
  maxStackingHeight: number | null;
  maxLoadBearing: number | null;
  isDangerous: boolean | null;
  imoClass: string | null;
  unNumber: string;
  properShippingName: string;
  packingGroup: string | null;
  isMarinePollutant: boolean | null;
}

const draftKey = (id: string) => `award-draft-${id}`;

function loadDraft(id: string): AwardDraft | null {
  try {
    const raw = localStorage.getItem(draftKey(id));
    return raw ? (JSON.parse(raw) as AwardDraft) : null;
  } catch {
    return null;
  }
}

function hasDraft(id: string): boolean {
  return localStorage.getItem(draftKey(id)) !== null;
}

function clearDraft(id: string) {
  localStorage.removeItem(draftKey(id));
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_TYPES = [
  { value: 'freezer', label: 'Freezer (-25°C to <10°C)' },
  { value: 'refrigerator', label: 'Refrigerator (2°C to 8°C)' },
  { value: 'cool', label: 'Cool (8°C to <15°C)' },
  { value: 'controlled_room', label: 'Controlled Room (15°C to <25°C)' },
];

const IMO_CLASSES = [
  { value: '1', label: 'Class 1 — Explosives' },
  { value: '2', label: 'Class 2 — Gases' },
  { value: '3', label: 'Class 3 — Flammable Liquids' },
  { value: '4', label: 'Class 4 — Flammable Solids' },
  { value: '5', label: 'Class 5 — Oxidizing Substances' },
  { value: '6', label: 'Class 6 — Toxic & Infectious Substances' },
  { value: '7', label: 'Class 7 — Radioactive Material' },
  { value: '8', label: 'Class 8 — Corrosives' },
  { value: '9', label: 'Class 9 — Miscellaneous' },
];

const PACKING_GROUPS = [
  { value: 'I', label: 'I — High Danger' },
  { value: 'II', label: 'II — Medium Danger' },
  { value: 'III', label: 'III — Low Danger' },
];

// ---------------------------------------------------------------------------
// Proportional split
// ---------------------------------------------------------------------------

function computeProportionalSplits(
  shipments: PlannedShipment[],
  totalQty: number
): ComputedSplit[] {
  const raw = shipments.map((s) => {
    const exact = totalQty * (s.percentage / 100);
    return {
      poNumber: s.poNumber,
      location: s.location,
      originalQty: s.quantity,
      percentage: s.percentage,
      exact,
      floored: Math.floor(exact),
    };
  });

  const flooredTotal = raw.reduce((sum, r) => sum + r.floored, 0);
  let remainder = totalQty - flooredTotal;

  const sorted = [...raw].sort(
    (a, b) => (b.exact - b.floored) - (a.exact - a.floored)
  );

  const extraMap = new Map<string, number>();
  for (const item of sorted) {
    extraMap.set(item.poNumber, remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder--;
  }

  return raw.map((r) => ({
    poNumber: r.poNumber,
    location: r.location,
    originalQty: r.originalQty,
    percentage: r.percentage,
    allocatedQty: r.floored + (extraMap.get(r.poNumber) ?? 0),
  }));
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: '#555',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: 12,
};

const fieldLabelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 6,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface SupplierAwardsProps {
  filterStatuses?: AwardStatus[];
}

export default function SupplierAwards({ filterStatuses }: SupplierAwardsProps) {
  const [awards, setAwards] = useState<SupplierAward[]>(supplierAwards);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAward, setSelectedAward] = useState<SupplierAward | null>(null);
  const [confirmationType, setConfirmationType] = useState<ConfirmationType>('full');

  // Wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const [confirmedQuantity, setConfirmedQuantity] = useState<number>(0);
  const [computedSplits, setComputedSplits] = useState<ComputedSplit[]>([]);
  const [draftRestored, setDraftRestored] = useState(false);

  // Used to force table re-renders when draft status changes
  const [draftRevision, setDraftRevision] = useState(0);

  // Carton details
  const [grossWeight, setGrossWeight] = useState<number | null>(null);
  const [cartonLength, setCartonLength] = useState<number | null>(null);
  const [cartonWidth, setCartonWidth] = useState<number | null>(null);
  const [cartonHeight, setCartonHeight] = useState<number | null>(null);
  const [packsPerCarton, setPacksPerCarton] = useState<number | null>(null);

  // Storage details
  const [storageType, setStorageType] = useState<string | null>(null);

  // Transportation details
  const [isStackable, setIsStackable] = useState<boolean | null>(null);
  const [maxStackingHeight, setMaxStackingHeight] = useState<number | null>(null);
  const [maxLoadBearing, setMaxLoadBearing] = useState<number | null>(null);
  const [isDangerous, setIsDangerous] = useState<boolean | null>(null);
  const [imoClass, setImoClass] = useState<string | null>(null);
  const [unNumber, setUnNumber] = useState<string>('');
  const [properShippingName, setProperShippingName] = useState<string>('');
  const [packingGroup, setPackingGroup] = useState<string | null>(null);
  const [isMarinePollutant, setIsMarinePollutant] = useState<boolean | null>(null);

  // ---------------------------------------------------------------------------
  // Auto-save draft to localStorage whenever form state changes
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!drawerOpen || !selectedAward || selectedAward.status !== 'pending_confirmation') return;

    const draft: AwardDraft = {
      step: currentStep,
      confirmationType,
      confirmedQuantity,
      grossWeight,
      cartonLength,
      cartonWidth,
      cartonHeight,
      packsPerCarton,
      storageType,
      isStackable,
      maxStackingHeight,
      maxLoadBearing,
      isDangerous,
      imoClass,
      unNumber,
      properShippingName,
      packingGroup,
      isMarinePollutant,
    };

    localStorage.setItem(draftKey(selectedAward.id), JSON.stringify(draft));
    setDraftRevision((v) => v + 1);
  }, [
    drawerOpen, selectedAward,
    currentStep, confirmationType, confirmedQuantity,
    grossWeight, cartonLength, cartonWidth, cartonHeight, packsPerCarton,
    storageType,
    isStackable, maxStackingHeight, maxLoadBearing,
    isDangerous, imoClass, unNumber, properShippingName, packingGroup, isMarinePollutant,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------------------------------------------------------------------------
  // State helpers
  // ---------------------------------------------------------------------------

  const resetTechnicalState = () => {
    setGrossWeight(null);
    setCartonLength(null);
    setCartonWidth(null);
    setCartonHeight(null);
    setPacksPerCarton(null);
    setStorageType(null);
    setIsStackable(null);
    setMaxStackingHeight(null);
    setMaxLoadBearing(null);
    setIsDangerous(null);
    setImoClass(null);
    setUnNumber('');
    setProperShippingName('');
    setPackingGroup(null);
    setIsMarinePollutant(null);
  };

  const applyDraft = (d: AwardDraft, award: SupplierAward) => {
    setConfirmationType(d.confirmationType);
    setCurrentStep(d.step);
    setConfirmedQuantity(d.confirmedQuantity);
    setGrossWeight(d.grossWeight);
    setCartonLength(d.cartonLength);
    setCartonWidth(d.cartonWidth);
    setCartonHeight(d.cartonHeight);
    setPacksPerCarton(d.packsPerCarton);
    setStorageType(d.storageType);
    setIsStackable(d.isStackable);
    setMaxStackingHeight(d.maxStackingHeight);
    setMaxLoadBearing(d.maxLoadBearing);
    setIsDangerous(d.isDangerous);
    setImoClass(d.imoClass);
    setUnNumber(d.unNumber);
    setProperShippingName(d.properShippingName);
    setPackingGroup(d.packingGroup);
    setIsMarinePollutant(d.isMarinePollutant);

    // Recompute splits if past step 0
    if (d.step >= 1) {
      const qty = d.confirmationType === 'full' ? award.totalQuantity : d.confirmedQuantity;
      setComputedSplits(computeProportionalSplits(award.plannedShipments, qty));
    }
  };

  const openConfirmDrawer = (award: SupplierAward) => {
    setSelectedAward(award);
    setComputedSplits([]);

    const draft = loadDraft(award.id);
    if (draft) {
      applyDraft(draft, award);
      setDraftRestored(true);
    } else {
      setConfirmationType('full');
      setCurrentStep(0);
      setConfirmedQuantity(award.totalQuantity);
      resetTechnicalState();
      setDraftRestored(false);
    }

    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedAward(null);
    setCurrentStep(0);
    setDraftRestored(false);
  };

  const handleDiscardDraft = () => {
    if (!selectedAward) return;
    clearDraft(selectedAward.id);
    setDraftRevision((v) => v + 1);
    // Reset to fresh state
    setConfirmationType('full');
    setCurrentStep(0);
    setConfirmedQuantity(selectedAward.totalQuantity);
    setComputedSplits([]);
    resetTechnicalState();
    setDraftRestored(false);
    message.info('Draft discarded.');
  };

  // ---------------------------------------------------------------------------
  // Step navigation
  // ---------------------------------------------------------------------------

  const handleNext = () => {
    if (!selectedAward) return;

    if (currentStep === 0) {
      if (confirmationType === 'withdraw') {
        handleWithdraw();
        return;
      }
      if (
        confirmationType === 'partial' &&
        (confirmedQuantity <= 0 || confirmedQuantity >= selectedAward.totalQuantity)
      ) {
        message.warning('Partial quantity must be greater than 0 and less than the awarded quantity.');
        return;
      }
      const qty = confirmationType === 'full' ? selectedAward.totalQuantity : confirmedQuantity;
      setComputedSplits(computeProportionalSplits(selectedAward.plannedShipments, qty));
      setCurrentStep(1);
    } else if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!grossWeight || grossWeight <= 0) { message.warning('Please enter gross weight.'); return; }
      if (!cartonLength || cartonLength <= 0) { message.warning('Please enter carton length.'); return; }
      if (!cartonWidth || cartonWidth <= 0) { message.warning('Please enter carton width.'); return; }
      if (!cartonHeight || cartonHeight <= 0) { message.warning('Please enter carton height.'); return; }
      if (!packsPerCarton || packsPerCarton <= 0) { message.warning('Please enter number of packs in carton.'); return; }
      if (!storageType) { message.warning('Please select a storage type.'); return; }
      if (isStackable === null) { message.warning('Please specify if the item is stackable.'); return; }
      if (isStackable && (!maxStackingHeight || !maxLoadBearing)) { message.warning('Please enter maximum stacking height and load bearing.'); return; }
      if (isDangerous === null) { message.warning('Please specify if this is a dangerous good.'); return; }
      if (isDangerous) {
        if (!imoClass) { message.warning('Please select an IMO class.'); return; }
        if (!unNumber.trim()) { message.warning('Please enter a UN number.'); return; }
        if (!properShippingName.trim()) { message.warning('Please enter the proper shipping name.'); return; }
        if (!packingGroup) { message.warning('Please select a packing group.'); return; }
        if (isMarinePollutant === null) { message.warning('Please specify if this is a marine pollutant.'); return; }
      }
      setCurrentStep(3);
    }
  };

  const handleBack = () => setCurrentStep((prev) => Math.max(0, prev - 1));

  const handleWithdraw = () => {
    if (!selectedAward) return;
    clearDraft(selectedAward.id);
    setDraftRevision((v) => v + 1);
    setAwards((prev) =>
      prev.map((a) =>
        a.id === selectedAward.id ? { ...a, status: 'withdrawn' as AwardStatus } : a
      )
    );
    message.success(`${selectedAward.skuName} — Withdrawn`);
    closeDrawer();
  };

  const handleConfirmSupply = () => {
    if (!selectedAward) return;
    const newStatus: AwardStatus = confirmationType === 'full' ? 'confirmed' : 'partially_confirmed';
    const finalQty = confirmationType === 'full' ? selectedAward.totalQuantity : confirmedQuantity;

    const confirmedAllocations: ConfirmedAllocation[] = computedSplits.map((s) => ({
      poNumber: s.poNumber,
      location: s.location,
      percentage: s.percentage,
      allocatedQty: s.allocatedQty,
    }));

    clearDraft(selectedAward.id);
    setDraftRevision((v) => v + 1);

    setAwards((prev) =>
      prev.map((a) =>
        a.id === selectedAward.id
          ? {
              ...a,
              status: newStatus,
              confirmedQuantity: finalQty,
              confirmationType: confirmationType === 'full' ? 'full' : 'partial',
              confirmedAllocations,
              technicalEnrichment: {
                dangerousGoods: isDangerous ?? false,
                storageTemp: STORAGE_TYPES.find((s) => s.value === storageType)?.label ?? '',
                shelfLife: '',
                batchNumber: '',
                grossWeight,
                cartonLength,
                cartonWidth,
                cartonHeight,
                packsPerCarton,
                numberOfCartons,
                storageType,
                isStackable,
                maxStackingHeight,
                maxLoadBearing,
                isDangerous,
                imoClass,
                unNumber,
                properShippingName,
                packingGroup,
                isMarinePollutant,
              },
            }
          : a
      )
    );

    message.success(`${selectedAward.skuName} — ${statusConfig[newStatus].label}`);
    closeDrawer();
  };

  // ---------------------------------------------------------------------------
  // Awards Table columns
  // ---------------------------------------------------------------------------

  // draftRevision is referenced here so the column re-renders when drafts change
  void draftRevision;

  const columns: ColumnsType<SupplierAward> = [
    {
      title: 'Medication',
      key: 'medication',
      render: (_, record) => (
        <div>
          <Text strong>{record.medicationName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.presentation}</Text>
        </div>
      ),
    },
    {
      title: (
        <span>
          Total volume{' '}
          <Tooltip title="Total quantity awarded across all ship-to locations">
            <InfoCircleOutlined style={{ color: '#aaa' }} />
          </Tooltip>
        </span>
      ),
      key: 'totalVolume',
      width: 180,
      render: (_, record) => (
        <span>
          {formatNumber(record.totalQuantity)}{' '}
          <Text type="secondary" style={{ fontSize: 12 }}>{record.volumeUnit}</Text>
        </span>
      ),
    },
    {
      title: (
        <span>
          Pack size{' '}
          <Tooltip title="Number of units per pack">
            <InfoCircleOutlined style={{ color: '#aaa' }} />
          </Tooltip>
        </span>
      ),
      dataIndex: 'packSize',
      key: 'packSize',
      width: 110,
      align: 'right',
      render: (v: number) => v.toLocaleString(),
    },
    {
      title: (
        <span>
          Pack price{' '}
          <Tooltip title="Price per pack when awarded less than 40% of total volume">
            <InfoCircleOutlined style={{ color: '#aaa' }} />
          </Tooltip>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>{'(<40%)'}</Text>
        </span>
      ),
      key: 'packPriceLow',
      width: 130,
      align: 'right',
      render: (_, record) => formatCurrency(record.packPriceLow, record.currency),
    },
    {
      title: (
        <span>
          Pack price{' '}
          <Tooltip title="Price per pack when awarded 40%–75% of total volume">
            <InfoCircleOutlined style={{ color: '#aaa' }} />
          </Tooltip>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>{`(>40%-75%)`}</Text>
        </span>
      ),
      key: 'packPriceMid',
      width: 140,
      align: 'right',
      render: (_, record) => formatCurrency(record.packPriceMid, record.currency),
    },
    {
      title: (
        <span>
          Pack price{' '}
          <Tooltip title="Price per pack when awarded more than 75% of total volume">
            <InfoCircleOutlined style={{ color: '#aaa' }} />
          </Tooltip>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>{`(>75%)`}</Text>
        </span>
      ),
      key: 'packPriceHigh',
      width: 120,
      align: 'right',
      render: (_, record) => formatCurrency(record.packPriceHigh, record.currency),
    },
    {
      title: 'Submitted',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      width: 130,
    },
    ...(!filterStatuses || filterStatuses.length > 1 ? [{
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 160,
      render: (status: AwardStatus) => {
        const cfg = statusConfig[status];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    }] : []),
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_, record) => {
        if (record.status === 'pending_confirmation') {
          const isDraft = hasDraft(record.id);
          return (
            <Button type="primary" size="small" onClick={() => openConfirmDrawer(record)}>
              {isDraft ? 'Resume Draft' : 'Confirm Supply'}
            </Button>
          );
        }
        return (
          <Button size="small" onClick={() => openConfirmDrawer(record)}>
            View Details
          </Button>
        );
      },
    },
  ];

  // ---------------------------------------------------------------------------
  // Shipment columns (read-only)
  // ---------------------------------------------------------------------------

  const shipmentColumns: ColumnsType<PlannedShipment> = [
    {
      title: 'PO #',
      dataIndex: 'poNumber',
      key: 'poNumber',
      width: 200,
      render: (text: string) => <Text code>{text}</Text>,
    },
    { title: 'Location', dataIndex: 'location', key: 'location' },
    {
      title: 'Quantity',
      key: 'quantity',
      width: 200,
      render: (_, record) => (
        <span>{formatNumber(record.quantity)} units ({record.percentage}%)</span>
      ),
    },
  ];

  // ---------------------------------------------------------------------------
  // Drawer content
  // ---------------------------------------------------------------------------

  const isPending = selectedAward?.status === 'pending_confirmation';
  const currentlyHasDraft = selectedAward ? hasDraft(selectedAward.id) : false;

  const numberOfCartons =
    packsPerCarton && packsPerCarton > 0 ? Math.ceil(confirmedQuantity / packsPerCarton) : null;

  const storageTypeLabel = STORAGE_TYPES.find((s) => s.value === storageType)?.label ?? '—';
  const imoClassLabel = IMO_CLASSES.find((c) => c.value === imoClass)?.label ?? '—';
  const packingGroupLabel = PACKING_GROUPS.find((p) => p.value === packingGroup)?.label ?? '—';

  const renderReadOnlyView = () => {
    if (!selectedAward) return null;
    const te = selectedAward.technicalEnrichment;
    const qty = selectedAward.confirmedQuantity ?? selectedAward.totalQuantity;
    const allocations = selectedAward.confirmedAllocations;

    const roStorageTypeLabel = te?.storageType
      ? STORAGE_TYPES.find((s) => s.value === te.storageType)?.label ?? te.storageType
      : te?.storageTemp ?? '—';
    const roImoClassLabel = te?.imoClass
      ? IMO_CLASSES.find((c) => c.value === te.imoClass)?.label ?? te.imoClass
      : '—';
    const roPackingGroupLabel = te?.packingGroup
      ? PACKING_GROUPS.find((p) => p.value === te.packingGroup)?.label ?? te.packingGroup
      : '—';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Award summary */}
        <div>
          <Title level={5} style={{ marginBottom: 8 }}>Confirmed Quantity</Title>
          <Descriptions bordered column={1} size="small" labelStyle={{ width: 160, fontWeight: 500 }}>
            <Descriptions.Item label="SKU">{selectedAward.skuName}</Descriptions.Item>
            <Descriptions.Item label="Awarded Quantity">
              {formatNumber(selectedAward.totalQuantity)} units
            </Descriptions.Item>
            <Descriptions.Item label="Confirmed Quantity">
              <Text strong>{formatNumber(qty)}</Text> units
              {selectedAward.confirmationType === 'partial' && (
                <Tag color="gold" style={{ marginLeft: 8 }}>Partial</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Unit Price">
              {formatCurrency(selectedAward.unitPrice, selectedAward.currency)}
            </Descriptions.Item>
            <Descriptions.Item label="Confirmed Value">
              <Text strong>{formatCurrency(qty * selectedAward.unitPrice, selectedAward.currency)}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={statusConfig[selectedAward.status].color}>
                {statusConfig[selectedAward.status].label}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </div>

        {/* Location allocation */}
        <div>
          <Title level={5} style={{ marginBottom: 8 }}>Location Allocation</Title>
          {allocations ? (
            <Table<ConfirmedAllocation>
              dataSource={allocations}
              rowKey="poNumber"
              pagination={false}
              bordered
              size="small"
              columns={[
                { title: 'PO #', dataIndex: 'poNumber', width: 180, render: (t: string) => <Text code>{t}</Text> },
                { title: 'Location', dataIndex: 'location' },
                { title: 'Ratio', dataIndex: 'percentage', width: 80, align: 'center' as const, render: (p: number) => `${p}%` },
                { title: 'Allocated Qty', dataIndex: 'allocatedQty', width: 130, align: 'right' as const, render: (q: number) => formatNumber(q) },
              ]}
            />
          ) : (
            <Table<PlannedShipment>
              columns={shipmentColumns}
              dataSource={selectedAward.plannedShipments}
              rowKey="poNumber"
              pagination={false}
              bordered
              size="small"
            />
          )}
        </div>

        {/* Technical enrichment */}
        {te && (
          <div>
            <Title level={5} style={{ marginBottom: 8 }}>Technical Enrichment</Title>
            <Descriptions bordered column={1} size="small" labelStyle={{ width: 180, fontWeight: 500 }}>
              {te.grossWeight != null && (
                <Descriptions.Item label="Gross Weight">{te.grossWeight} kg</Descriptions.Item>
              )}
              {te.cartonLength != null && (
                <Descriptions.Item label="Dimensions (L×W×H)">
                  {te.cartonLength} × {te.cartonWidth} × {te.cartonHeight} cm
                </Descriptions.Item>
              )}
              {te.packsPerCarton != null && (
                <Descriptions.Item label="Packs per Carton">{te.packsPerCarton}</Descriptions.Item>
              )}
              {te.numberOfCartons != null && (
                <Descriptions.Item label="Number of Cartons">{te.numberOfCartons}</Descriptions.Item>
              )}
              <Descriptions.Item label="Storage Type">{roStorageTypeLabel}</Descriptions.Item>
              {te.isStackable != null && (
                <Descriptions.Item label="Stackable">
                  {te.isStackable
                    ? `Yes (max ${te.maxStackingHeight} cm / ${te.maxLoadBearing} kg)`
                    : 'No'}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Dangerous Good">
                {(te.isDangerous ?? te.dangerousGoods) ? 'Yes' : 'No'}
              </Descriptions.Item>
              {(te.isDangerous ?? te.dangerousGoods) && (
                <>
                  <Descriptions.Item label="IMO Class">{roImoClassLabel}</Descriptions.Item>
                  {te.unNumber && (
                    <Descriptions.Item label="UN Number">{te.unNumber}</Descriptions.Item>
                  )}
                  {te.properShippingName && (
                    <Descriptions.Item label="Proper Shipping Name">{te.properShippingName}</Descriptions.Item>
                  )}
                  {te.packingGroup && (
                    <Descriptions.Item label="Packing Group">{roPackingGroupLabel}</Descriptions.Item>
                  )}
                  {te.isMarinePollutant != null && (
                    <Descriptions.Item label="Marine Pollutant">
                      {te.isMarinePollutant ? 'Yes' : 'No'}
                    </Descriptions.Item>
                  )}
                </>
              )}
            </Descriptions>
          </div>
        )}
      </div>
    );
  };

  const renderWizard = () => {
    if (!selectedAward) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Steps
          current={currentStep}
          size="small"
          items={[
            { title: 'Quantity' },
            { title: 'PO Allocations' },
            { title: 'Technical' },
            { title: 'Review' },
          ]}
        />

        {draftRestored && (
          <Alert
            message="Draft restored — continue from where you left off."
            type="info"
            showIcon
            closable
            onClose={() => setDraftRestored(false)}
          />
        )}

        {/* Step 0 — Confirm Quantity */}
        {currentStep === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Descriptions bordered column={1} size="small" labelStyle={{ width: 140, fontWeight: 500 }}>
              <Descriptions.Item label="SKU">{selectedAward.skuName}</Descriptions.Item>
              <Descriptions.Item label="Awarded Quantity">
                {formatNumber(selectedAward.totalQuantity)} units
              </Descriptions.Item>
              <Descriptions.Item label="Unit Price">
                {formatCurrency(selectedAward.unitPrice, selectedAward.currency)}
              </Descriptions.Item>
              <Descriptions.Item label="Total Value">
                {formatCurrency(selectedAward.totalQuantity * selectedAward.unitPrice, selectedAward.currency)}
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: 0 }} />

            <div>
              <Title level={5} style={{ marginBottom: 12 }}>How would you like to respond?</Title>
              <Radio.Group
                value={confirmationType}
                onChange={(e) => {
                  setConfirmationType(e.target.value);
                  if (e.target.value === 'full') setConfirmedQuantity(selectedAward.totalQuantity);
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                <Radio value="full">
                  Confirm full quantity ({formatNumber(selectedAward.totalQuantity)} units)
                </Radio>
                <Radio value="partial">Confirm partial quantity</Radio>
                <Radio value="withdraw">Withdraw</Radio>
              </Radio.Group>
            </div>

            {confirmationType === 'partial' && (
              <div style={{ paddingLeft: 24 }}>
                <Text strong style={fieldLabelStyle}>Quantity you can supply</Text>
                <InputNumber
                  value={confirmedQuantity}
                  onChange={(val) => setConfirmedQuantity(val ?? 0)}
                  min={1}
                  max={selectedAward.totalQuantity - 1}
                  style={{ width: 200 }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => Number(value?.replace(/,/g, '') ?? 0)}
                  addonAfter="units"
                />
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Max: {formatNumber(selectedAward.totalQuantity)} units
                  </Text>
                </div>
              </div>
            )}

            {confirmationType === 'withdraw' && (
              <Alert
                message="You are about to withdraw from this award. This action cannot be undone."
                type="warning"
                showIcon
              />
            )}
          </div>
        )}

        {/* Step 1 — PO Allocations */}
        {currentStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Alert
              message={
                <span>
                  Confirmed quantity: <strong>{formatNumber(confirmedQuantity)}</strong> of{' '}
                  {formatNumber(selectedAward.totalQuantity)} units
                  {confirmationType === 'partial' && (
                    <Tag color="gold" style={{ marginLeft: 8 }}>Partial</Tag>
                  )}
                </span>
              }
              type="info"
              showIcon
            />

            <div>
              <Title level={5} style={{ marginBottom: 4 }}>Proportional Allocation by Location</Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                Quantities are allocated automatically based on the planned shipment ratios.
              </Text>
              <Table<ComputedSplit>
                dataSource={computedSplits}
                rowKey="poNumber"
                pagination={false}
                bordered
                size="small"
                columns={[
                  {
                    title: 'PO #',
                    dataIndex: 'poNumber',
                    key: 'poNumber',
                    width: 180,
                    render: (text: string) => <Text code>{text}</Text>,
                  },
                  { title: 'Location', dataIndex: 'location', key: 'location' },
                  {
                    title: 'Ratio',
                    dataIndex: 'percentage',
                    key: 'percentage',
                    width: 80,
                    align: 'center',
                    render: (pct: number) => `${pct}%`,
                  },
                  {
                    title: 'Allocated Qty',
                    dataIndex: 'allocatedQty',
                    key: 'allocatedQty',
                    width: 140,
                    align: 'right',
                    render: (qty: number) => <Text strong>{formatNumber(qty)}</Text>,
                  },
                ]}
              />
            </div>

            <Alert
              message="Allocation across locations is determined by the system based on planned shipment ratios."
              type="info"
              showIcon
            />
          </div>
        )}

        {/* Step 2 — Technical Enrichment */}
        {currentStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Carton details */}
            <div>
              <div style={sectionTitleStyle}>Carton details</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' }}>
                <div>
                  <Text strong style={fieldLabelStyle}>Gross weight</Text>
                  <InputNumber value={grossWeight} onChange={setGrossWeight} min={0} addonAfter="kg" style={{ width: '100%' }} placeholder="0" />
                </div>
                <div>
                  <Text strong style={fieldLabelStyle}>Length</Text>
                  <InputNumber value={cartonLength} onChange={setCartonLength} min={0} addonAfter="cm" style={{ width: '100%' }} placeholder="0" />
                </div>
                <div>
                  <Text strong style={fieldLabelStyle}>Width</Text>
                  <InputNumber value={cartonWidth} onChange={setCartonWidth} min={0} addonAfter="cm" style={{ width: '100%' }} placeholder="0" />
                </div>
                <div>
                  <Text strong style={fieldLabelStyle}>Height</Text>
                  <InputNumber value={cartonHeight} onChange={setCartonHeight} min={0} addonAfter="cm" style={{ width: '100%' }} placeholder="0" />
                </div>
                <div>
                  <Text strong style={fieldLabelStyle}>Number of packs in carton</Text>
                  <InputNumber value={packsPerCarton} onChange={setPacksPerCarton} min={1} style={{ width: '100%' }} placeholder="0" />
                </div>
                <div>
                  <Text strong style={fieldLabelStyle}>Number of cartons</Text>
                  <InputNumber value={numberOfCartons ?? undefined} disabled style={{ width: '100%' }} placeholder="Calculated" />
                </div>
              </div>
            </div>

            <Divider style={{ margin: 0 }} />

            {/* Storage details */}
            <div>
              <div style={sectionTitleStyle}>Storage details</div>
              <Text strong style={fieldLabelStyle}>Type of storage</Text>
              <Select
                value={storageType}
                onChange={setStorageType}
                placeholder="Select storage type"
                style={{ width: '100%' }}
                options={STORAGE_TYPES}
              />
            </div>

            <Divider style={{ margin: 0 }} />

            {/* Transportation details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={sectionTitleStyle}>Transportation details</div>

              <div>
                <Text strong style={fieldLabelStyle}>Is this stackable?</Text>
                <Radio.Group
                  value={isStackable}
                  onChange={(e) => {
                    setIsStackable(e.target.value);
                    if (!e.target.value) { setMaxStackingHeight(null); setMaxLoadBearing(null); }
                  }}
                >
                  <Radio value={true}>Yes</Radio>
                  <Radio value={false}>No</Radio>
                </Radio.Group>

                {isStackable === true && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px', marginTop: 12, padding: 12, background: '#fafafa', borderRadius: 6, border: '1px solid #f0f0f0' }}>
                    <div>
                      <Text strong style={fieldLabelStyle}>Maximum Stacking Height <Text type="danger">*</Text></Text>
                      <InputNumber value={maxStackingHeight} onChange={setMaxStackingHeight} min={0} addonAfter="cm" style={{ width: '100%' }} placeholder="0" />
                    </div>
                    <div>
                      <Text strong style={fieldLabelStyle}>Maximum Load Bearing <Text type="danger">*</Text></Text>
                      <InputNumber value={maxLoadBearing} onChange={setMaxLoadBearing} min={0} addonAfter="kg" style={{ width: '100%' }} placeholder="0" />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Text strong style={fieldLabelStyle}>Is this a dangerous good?</Text>
                <Radio.Group
                  value={isDangerous}
                  onChange={(e) => {
                    setIsDangerous(e.target.value);
                    if (!e.target.value) {
                      setImoClass(null); setUnNumber(''); setProperShippingName('');
                      setPackingGroup(null); setIsMarinePollutant(null);
                    }
                  }}
                >
                  <Radio value={true}>Yes</Radio>
                  <Radio value={false}>No</Radio>
                </Radio.Group>

                {isDangerous === true && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12, padding: 12, background: '#fafafa', borderRadius: 6, border: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' }}>
                      <div>
                        <Text strong style={fieldLabelStyle}>IMO Class <Text type="danger">*</Text></Text>
                        <Select value={imoClass} onChange={setImoClass} placeholder="Select" style={{ width: '100%' }} options={IMO_CLASSES} />
                      </div>
                      <div>
                        <Text strong style={fieldLabelStyle}>UN Number <Text type="danger">*</Text></Text>
                        <Input value={unNumber} onChange={(e) => setUnNumber(e.target.value)} placeholder="e.g. 1234" />
                      </div>
                      <div>
                        <Text strong style={fieldLabelStyle}>Packing Group <Text type="danger">*</Text></Text>
                        <Select value={packingGroup} onChange={setPackingGroup} placeholder="Select" style={{ width: '100%' }} options={PACKING_GROUPS} />
                      </div>
                    </div>
                    <div>
                      <Text strong style={fieldLabelStyle}>Proper Shipping Name <Text type="danger">*</Text></Text>
                      <Input value={properShippingName} onChange={(e) => setProperShippingName(e.target.value)} placeholder="Enter proper shipping name" />
                    </div>
                    <div>
                      <Text strong style={fieldLabelStyle}>Is this a marine pollutant? <Text type="danger">*</Text></Text>
                      <Radio.Group value={isMarinePollutant} onChange={(e) => setIsMarinePollutant(e.target.value)}>
                        <Radio value={true}>Yes</Radio>
                        <Radio value={false}>No</Radio>
                      </Radio.Group>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Review & Confirm */}
        {currentStep === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Alert message="Please review all details below before confirming." type="info" showIcon />

            <div>
              <Title level={5} style={{ marginBottom: 8 }}>Confirmed Quantity</Title>
              <Descriptions bordered column={1} size="small" labelStyle={{ width: 160, fontWeight: 500 }}>
                <Descriptions.Item label="SKU">{selectedAward.skuName}</Descriptions.Item>
                <Descriptions.Item label="Awarded Quantity">{formatNumber(selectedAward.totalQuantity)} units</Descriptions.Item>
                <Descriptions.Item label="Confirmed Quantity">
                  <Text strong>{formatNumber(confirmedQuantity)}</Text> units
                  {confirmationType === 'partial' && <Tag color="gold" style={{ marginLeft: 8 }}>Partial</Tag>}
                </Descriptions.Item>
                <Descriptions.Item label="Unit Price">{formatCurrency(selectedAward.unitPrice, selectedAward.currency)}</Descriptions.Item>
                <Descriptions.Item label="Confirmed Value">
                  <Text strong>{formatCurrency(confirmedQuantity * selectedAward.unitPrice, selectedAward.currency)}</Text>
                </Descriptions.Item>
              </Descriptions>
            </div>

            <div>
              <Title level={5} style={{ marginBottom: 8 }}>Location Allocation</Title>
              <Table<ComputedSplit>
                dataSource={computedSplits}
                rowKey="poNumber"
                pagination={false}
                bordered
                size="small"
                columns={[
                  { title: 'PO #', dataIndex: 'poNumber', width: 180, render: (t: string) => <Text code>{t}</Text> },
                  { title: 'Location', dataIndex: 'location' },
                  { title: 'Ratio', dataIndex: 'percentage', width: 80, align: 'center' as const, render: (p: number) => `${p}%` },
                  { title: 'Qty', dataIndex: 'allocatedQty', width: 120, align: 'right' as const, render: (q: number) => formatNumber(q) },
                ]}
              />
            </div>

            <div>
              <Title level={5} style={{ marginBottom: 8 }}>Technical Enrichment</Title>
              <Descriptions bordered column={1} size="small" labelStyle={{ width: 180, fontWeight: 500 }}>
                <Descriptions.Item label="Gross Weight">{grossWeight} kg</Descriptions.Item>
                <Descriptions.Item label="Dimensions (L×W×H)">{cartonLength} × {cartonWidth} × {cartonHeight} cm</Descriptions.Item>
                <Descriptions.Item label="Packs per Carton">{packsPerCarton}</Descriptions.Item>
                <Descriptions.Item label="Number of Cartons">{numberOfCartons}</Descriptions.Item>
                <Descriptions.Item label="Storage Type">{storageTypeLabel}</Descriptions.Item>
                <Descriptions.Item label="Stackable">
                  {isStackable ? `Yes (max ${maxStackingHeight} cm / ${maxLoadBearing} kg)` : 'No'}
                </Descriptions.Item>
                <Descriptions.Item label="Dangerous Good">{isDangerous ? 'Yes' : 'No'}</Descriptions.Item>
                {isDangerous && (
                  <>
                    <Descriptions.Item label="IMO Class">{imoClassLabel}</Descriptions.Item>
                    <Descriptions.Item label="UN Number">{unNumber}</Descriptions.Item>
                    <Descriptions.Item label="Proper Shipping Name">{properShippingName}</Descriptions.Item>
                    <Descriptions.Item label="Packing Group">{packingGroupLabel}</Descriptions.Item>
                    <Descriptions.Item label="Marine Pollutant">{isMarinePollutant ? 'Yes' : 'No'}</Descriptions.Item>
                  </>
                )}
              </Descriptions>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const visibleAwards = filterStatuses
    ? awards.filter((a) => filterStatuses.includes(a.status))
    : awards;

  return (
    <>
      <Table<SupplierAward>
        columns={columns}
        dataSource={visibleAwards}
        rowKey="id"
        pagination={false}
        bordered
        size="middle"
        style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      />

      <Drawer
        title={
          selectedAward
            ? isPending
              ? `Confirm Supply — ${selectedAward.skuName}`
              : selectedAward.skuName
            : 'Award Details'
        }
        placement="right"
        width={680}
        open={drawerOpen}
        onClose={closeDrawer}
        footer={
          isPending ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {currentStep > 0 && <Button onClick={handleBack}>Back</Button>}
                {currentlyHasDraft && (
                  <Button
                    type="text"
                    danger
                    size="small"
                    onClick={handleDiscardDraft}
                  >
                    Discard Draft
                  </Button>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button onClick={closeDrawer}>Save & Close</Button>
                {currentStep < 3 ? (
                  <Button
                    type="primary"
                    onClick={handleNext}
                    danger={confirmationType === 'withdraw' && currentStep === 0}
                  >
                    {confirmationType === 'withdraw' && currentStep === 0
                      ? 'Confirm Withdrawal'
                      : 'Next'}
                  </Button>
                ) : (
                  <Button type="primary" onClick={handleConfirmSupply}>
                    Confirm Supply
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={closeDrawer}>Close</Button>
            </div>
          )
        }
      >
        {selectedAward && (isPending ? renderWizard() : renderReadOnlyView())}
      </Drawer>
    </>
  );
}
