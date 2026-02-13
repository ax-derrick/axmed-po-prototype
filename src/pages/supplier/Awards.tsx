import { useState } from 'react';
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
  Collapse,
  message,
  Alert,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { supplierAwards } from '../../data/mockData';
import type { SupplierAward, PlannedShipment } from '../../data/mockData';

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

const statusConfig: Record<AwardStatus, { color: string; label: string }> = {
  pending_confirmation: { color: 'orange', label: 'Pending Confirmation' },
  confirmed: { color: 'green', label: 'Confirmed' },
  partially_confirmed: { color: 'gold', label: 'Partially Confirmed' },
  withdrawn: { color: 'red', label: 'Withdrawn' },
};

type ConfirmationType = 'full' | 'partial' | 'withdraw';

interface PartialQuantities {
  [poNumber: string]: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SupplierAwards() {
  const [awards, setAwards] = useState<SupplierAward[]>(supplierAwards);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAward, setSelectedAward] = useState<SupplierAward | null>(null);
  const [confirmationType, setConfirmationType] = useState<ConfirmationType>('full');
  const [partialQuantities, setPartialQuantities] = useState<PartialQuantities>({});

  // Technical enrichment form state
  const [dangerousGoods, setDangerousGoods] = useState<boolean | null>(null);
  const [storageTemp, setStorageTemperature] = useState<string | null>(null);
  const [shelfLife, setShelfLife] = useState<number | null>(null);
  const [batchNumber, setBatchNumber] = useState<string>('');

  // Open drawer for a specific award
  const openConfirmDrawer = (award: SupplierAward) => {
    setSelectedAward(award);
    setConfirmationType('full');
    setPartialQuantities({});
    setDangerousGoods(award.technicalEnrichment?.dangerousGoods ?? null);
    setStorageTemperature(award.technicalEnrichment?.storageTemp ?? null);
    setShelfLife(award.technicalEnrichment?.shelfLife ? parseInt(award.technicalEnrichment.shelfLife) : null);
    setBatchNumber(award.technicalEnrichment?.batchNumber ?? '');
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedAward(null);
  };

  // Handle confirm supply action
  const handleConfirmSupply = () => {
    if (!selectedAward) return;

    let newStatus: AwardStatus;
    if (confirmationType === 'full') {
      newStatus = 'confirmed';
    } else if (confirmationType === 'partial') {
      newStatus = 'partially_confirmed';
    } else {
      newStatus = 'withdrawn';
    }

    setAwards((prev) =>
      prev.map((a) =>
        a.id === selectedAward.id
          ? {
              ...a,
              status: newStatus,
              technicalEnrichment: {
                dangerousGoods: dangerousGoods ?? false,
                storageTemp: storageTemp ?? '',
                shelfLife: shelfLife != null ? `${shelfLife} months` : '',
                batchNumber: batchNumber || '',
              },
            }
          : a
      )
    );

    const statusLabel = statusConfig[newStatus].label;
    message.success(`${selectedAward.skuName} — ${statusLabel}`);
    closeDrawer();
  };

  // ---------------------------------------------------------------------------
  // Awards Table columns
  // ---------------------------------------------------------------------------

  const columns: ColumnsType<SupplierAward> = [
    {
      title: 'SKU',
      dataIndex: 'skuName',
      key: 'skuName',
      width: 220,
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Total Quantity',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      width: 140,
      align: 'right',
      render: (qty: number) => formatNumber(qty),
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      align: 'right',
      render: (price: number, record) => formatCurrency(price, record.currency),
    },
    {
      title: 'Total Value',
      key: 'totalValue',
      width: 150,
      align: 'right',
      render: (_, record) =>
        formatCurrency(record.totalQuantity * record.unitPrice, record.currency),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 180,
      render: (status: AwardStatus) => {
        const cfg = statusConfig[status];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, record) => {
        if (record.status === 'pending_confirmation') {
          return (
            <Button type="primary" size="small" onClick={() => openConfirmDrawer(record)}>
              Confirm Supply
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
  // Planned Shipment Table columns (inside drawer)
  // ---------------------------------------------------------------------------

  const shipmentColumns: ColumnsType<PlannedShipment> = [
    {
      title: 'PO #',
      dataIndex: 'poNumber',
      key: 'poNumber',
      width: 200,
      render: (text: string) => <Text code>{text}</Text>,
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Quantity',
      key: 'quantity',
      width: 280,
      render: (_, record) => (
        <span>
          {formatNumber(record.quantity)} units ({record.percentage}%)
        </span>
      ),
    },
  ];

  // Partial quantity columns — adds an InputNumber for each shipment row
  const partialShipmentColumns: ColumnsType<PlannedShipment> = [
    ...shipmentColumns,
    {
      title: 'Confirm Qty',
      key: 'confirmQty',
      width: 160,
      render: (_, record) => (
        <InputNumber
          min={0}
          max={record.quantity}
          value={partialQuantities[record.poNumber] ?? record.quantity}
          onChange={(val) =>
            setPartialQuantities((prev) => ({
              ...prev,
              [record.poNumber]: val ?? 0,
            }))
          }
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => Number(value?.replace(/,/g, '') ?? 0)}
          style={{ width: '100%' }}
        />
      ),
    },
  ];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div style={{ padding: 24, background: '#fff', borderRadius: 8, minHeight: '100%' }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ marginBottom: 4 }}>
          Awards
        </Title>
        <Text type="secondary">Review your awarded items and confirm supply</Text>
      </div>

      {/* Awards table */}
      <Table<SupplierAward>
        columns={columns}
        dataSource={awards}
        rowKey="id"
        pagination={false}
        bordered
        size="middle"
        style={{
          background: '#fff',
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      />

      {/* Confirm Supply Drawer */}
      <Drawer
        title={selectedAward ? `Confirm Supply — ${selectedAward.skuName}` : 'Confirm Supply'}
        placement="right"
        width={600}
        open={drawerOpen}
        onClose={closeDrawer}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={closeDrawer}>Cancel</Button>
            {selectedAward?.status === 'pending_confirmation' && (
              <Button type="primary" onClick={handleConfirmSupply}>
                Confirm Supply
              </Button>
            )}
          </div>
        }
      >
        {selectedAward && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* 1. SKU Details */}
            <Descriptions
              title="SKU Details"
              bordered
              column={1}
              size="small"
              labelStyle={{ width: 140, fontWeight: 500 }}
            >
              <Descriptions.Item label="SKU Name">{selectedAward.skuName}</Descriptions.Item>
              <Descriptions.Item label="Description">{selectedAward.description}</Descriptions.Item>
              <Descriptions.Item label="Total Quantity">
                {formatNumber(selectedAward.totalQuantity)}
              </Descriptions.Item>
              <Descriptions.Item label="Unit Price">
                {formatCurrency(selectedAward.unitPrice, selectedAward.currency)}
              </Descriptions.Item>
              <Descriptions.Item label="Total Value">
                {formatCurrency(
                  selectedAward.totalQuantity * selectedAward.unitPrice,
                  selectedAward.currency
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={statusConfig[selectedAward.status].color}>
                  {statusConfig[selectedAward.status].label}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {/* 2. Planned Shipments */}
            <div>
              <Title level={5} style={{ marginBottom: 12 }}>
                Planned Shipments
              </Title>
              <Table<PlannedShipment>
                columns={
                  confirmationType === 'partial' ? partialShipmentColumns : shipmentColumns
                }
                dataSource={selectedAward.plannedShipments}
                rowKey="poNumber"
                pagination={false}
                bordered
                size="small"
              />
              <Alert
                message="Procurer name is not disclosed"
                type="info"
                showIcon
                style={{ marginTop: 8 }}
              />
            </div>

            {/* 3. Confirmation section (only for pending awards) */}
            {selectedAward.status === 'pending_confirmation' && (
              <div>
                <Title level={5} style={{ marginBottom: 12 }}>
                  Confirmation
                </Title>
                <Radio.Group
                  value={confirmationType}
                  onChange={(e) => setConfirmationType(e.target.value)}
                  style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                >
                  <Radio value="full">Confirm full quantity</Radio>
                  <Radio value="partial">Confirm partial quantity</Radio>
                  <Radio value="withdraw">Withdraw</Radio>
                </Radio.Group>
              </div>
            )}

            {/* 4. Technical Enrichment */}
            <Collapse
              items={[
                {
                  key: 'technical',
                  label: 'Technical Enrichment',
                  children: (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div>
                        <Text strong style={{ display: 'block', marginBottom: 6 }}>
                          Dangerous Goods
                        </Text>
                        <Radio.Group
                          value={dangerousGoods}
                          onChange={(e) => setDangerousGoods(e.target.value)}
                        >
                          <Radio value={true}>Yes</Radio>
                          <Radio value={false}>No</Radio>
                        </Radio.Group>
                      </div>

                      <div>
                        <Text strong style={{ display: 'block', marginBottom: 6 }}>
                          Storage Temperature
                        </Text>
                        <Select
                          value={storageTemp}
                          onChange={(val) => setStorageTemperature(val)}
                          placeholder="Select storage temperature"
                          style={{ width: '100%' }}
                          options={[
                            { value: 'Ambient', label: 'Ambient' },
                            { value: '2-8°C Cold Chain', label: '2-8°C Cold Chain' },
                            { value: '-20°C Frozen', label: '-20°C Frozen' },
                          ]}
                          allowClear
                        />
                      </div>

                      <div>
                        <Text strong style={{ display: 'block', marginBottom: 6 }}>
                          Shelf Life (months)
                        </Text>
                        <InputNumber
                          value={shelfLife}
                          onChange={(val) => setShelfLife(val)}
                          min={1}
                          max={120}
                          placeholder="e.g. 36"
                          style={{ width: '100%' }}
                        />
                      </div>

                      <div>
                        <Text strong style={{ display: 'block', marginBottom: 6 }}>
                          Batch Number
                        </Text>
                        <Input
                          value={batchNumber}
                          onChange={(e) => setBatchNumber(e.target.value)}
                          placeholder="e.g. AMX-2026-B001"
                        />
                      </div>

                      <Alert
                        message="Required before items move to Confirmed tab"
                        type="warning"
                        showIcon
                      />
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
}
