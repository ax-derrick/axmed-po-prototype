import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button,
  Tag,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Typography,
  Divider,
  Space,
  Modal,
  Alert,
  Table,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ArrowLeftOutlined, FileTextOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  supplierOrganizations,
  legalEntities,
  paymentTerms,
} from '../data/mockData';
import type { PurchaseOrder, POLineItem } from '../data/mockData';
import { usePOFlow } from '../context/POFlowContext';

type POStatus = PurchaseOrder['status'];

const { Title, Text } = Typography;

const currencyOptions = [
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'GBP', value: 'GBP' },
];

const statusColorMap: Record<POStatus, string> = {
  draft: 'orange',
  cleared_by_commercial: 'blue',
  submitted: 'green',
  confirmed: 'green',
  partially_confirmed: 'cyan',
};

const statusLabelMap: Record<POStatus, string> = {
  draft: 'Draft',
  cleared_by_commercial: 'Cleared by Commercial',
  submitted: 'Submitted',
  confirmed: 'Confirmed',
  partially_confirmed: 'Partially Confirmed',
};

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function POReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { purchaseOrders, updatePOStatus } = usePOFlow();

  // Find the PO
  const po = purchaseOrders.find((p) => p.id === id);

  // Find the supplier org for this PO
  const supplierOrg = useMemo(() => {
    if (!po) return null;
    return supplierOrganizations.find((s: { name: string }) => s.name === po.supplier) || null;
  }, [po]);

  // State
  const [status, setStatus] = useState<POStatus>(po?.status || 'draft');
  const [vendorContactEmail, setVendorContactEmail] = useState<string>(
    supplierOrg?.contacts[0]?.email || ''
  );
  const [customContactName, setCustomContactName] = useState<string>('');
  const [customContactEmail, setCustomContactEmail] = useState<string>('');
  const isCustomContact = vendorContactEmail === '__custom__';
  const [billToEntityId, setBillToEntityId] = useState<string>('le-2');
  const [billToEmail, setBillToEmail] = useState<string>('finance@axmed.com');
  const [shipToName, setShipToName] = useState<string>(po?.shipToName || '');
  const [terms, setTerms] = useState<string>(po?.terms || 'Net 30 on Delivery');
  const poDate = dayjs();
  const [currency, setCurrency] = useState<string>(po?.currency || 'USD');
  const [displayAsPacks, setDisplayAsPacks] = useState<boolean>(false);
  const [vatPercent, setVatPercent] = useState<number>(0);

  // Derived values
  const selectedContact = useMemo(() => {
    if (!supplierOrg) return null;
    return supplierOrg.contacts.find((c: { email: string }) => c.email === vendorContactEmail) || null;
  }, [supplierOrg, vendorContactEmail]);

  const billToEntity = useMemo(() => {
    return legalEntities.find((e) => e.id === billToEntityId) || null;
  }, [billToEntityId]);

  const shipToOptions = useMemo(() => {
    const options = legalEntities.map((e) => ({ label: e.name, value: e.name }));
    if (po?.shipToName) {
      options.unshift({ label: po.shipToName, value: po.shipToName });
    }
    return options;
  }, [po]);

  const subtotal = useMemo(() => {
    if (!po) return 0;
    return po.lineItems.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0);
  }, [po]);

  const vatAmount = useMemo(() => {
    return subtotal * (vatPercent / 100);
  }, [subtotal, vatPercent]);

  const grandTotal = useMemo(() => {
    return subtotal + vatAmount;
  }, [subtotal, vatAmount]);

  const isReadOnly = status === 'submitted' || status === 'confirmed' || status === 'partially_confirmed';
  const [previewOpen, setPreviewOpen] = useState(false);

  // Not found
  if (!po) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <Title level={3}>PO not found</Title>
        <Text type="secondary">
          The purchase order you are looking for does not exist.
        </Text>
        <br />
        <br />
        <Button type="primary" onClick={() => navigate('/finance/purchase-orders')}>
          Back to Purchase Orders
        </Button>
      </div>
    );
  }

  // Action handlers
  const handleSaveDraft = () => {
    message.success('Draft saved.');
  };

  const handleMarkCompleted = () => {
    Modal.confirm({
      title: 'Mark as Completed',
      content:
        'Mark this PO as completed? It will be sent to Finance for review.',
      okText: 'Yes, Mark as Completed',
      cancelText: 'Cancel',
      onOk: () => {
        setStatus('cleared_by_commercial');
        updatePOStatus(po!.id, 'cleared_by_commercial');
        message.success(
          'PO marked as completed and sent to Finance for review.'
        );
      },
    });
  };

  const handleSendToSupplier = () => {
    Modal.confirm({
      title: 'Send to Supplier',
      content:
        'Send this PO to the supplier? An award email will be sent.',
      okText: 'Yes, Send to Supplier',
      cancelText: 'Cancel',
      onOk: () => {
        setStatus('submitted');
        updatePOStatus(po!.id, 'submitted');
        message.success('PO has been sent to the supplier.');
      },
    });
  };

  const handleSendBackToDraft = () => {
    Modal.confirm({
      title: 'Send Back to Draft',
      content:
        'Send this PO back to draft? The commercial team will need to review it again.',
      okText: 'Yes, Send Back',
      cancelText: 'Cancel',
      onOk: () => {
        setStatus('draft');
        updatePOStatus(po!.id, 'draft');
        message.success('PO has been reverted to draft status.');
      },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', background: '#f5f5f5', margin: -24 }}>
      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          flexWrap: 'wrap',
          gap: 12,
          flexShrink: 0,
        }}
      >
        <Space align="center" size={16}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/finance/purchase-orders')}
            style={{ fontWeight: 500 }}
          >
            Back to Purchase Orders
          </Button>
          <Divider type="vertical" style={{ height: 24 }} />
          <Title level={4} style={{ margin: 0 }}>
            {po.poNumber}
          </Title>
          <Tag color={statusColorMap[status]}>{statusLabelMap[status]}</Tag>
        </Space>

        {isReadOnly ? (
          <Button
            icon={<FileTextOutlined />}
            onClick={() => setPreviewOpen((o) => !o)}
          >
            {previewOpen ? 'Hide Document' : 'View PO Document'}
          </Button>
        ) : (
          <Space wrap>
            <Button onClick={handleSaveDraft}>Save as Draft</Button>
            {status === 'draft' && (
              <Button type="primary" onClick={handleMarkCompleted}>
                Mark as Completed
              </Button>
            )}
            {status === 'cleared_by_commercial' && (
              <>
                <Button onClick={handleSendBackToDraft}>Send Back to Draft</Button>
                <Button
                  type="primary"
                  style={{ backgroundColor: '#392AB0', borderColor: '#392AB0' }}
                  onClick={handleSendToSupplier}
                >
                  Send to Supplier
                </Button>
              </>
            )}
          </Space>
        )}
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, gap: 24, padding: '0 24px 24px', minHeight: 0 }}>
        {/* Left Column — Form / Line Item Status */}
        <div style={{ flex: isReadOnly && !previewOpen ? 1 : `0 0 ${isReadOnly ? '55%' : '41.67%'}`, maxWidth: isReadOnly && !previewOpen ? '100%' : (isReadOnly ? '55%' : '41.67%'), overflowY: 'auto' }}>
        {isReadOnly ? (
          <LineItemStatusPanel lineItems={po.lineItems} currency={po.currency} vatPercent={vatPercent} />
        ) : (
          <div
            style={{
              background: '#fff',
              padding: 24,
              borderRadius: 8,
            }}
          >
            <Form layout="vertical" size="middle">
              {/* Section 1: Vendor Contact */}
              <Title level={5} style={{ marginBottom: 16 }}>
                Vendor Contact
              </Title>
              <Form.Item label="Contact Person">
                <Select
                  value={vendorContactEmail || undefined}
                  placeholder="Select a contact"
                  onChange={(val: string) => setVendorContactEmail(val)}
                  options={[
                    ...(supplierOrg?.contacts.map((c: { name: string; email: string; role: string }) => ({
                      label: `${c.name} (${c.role})`,
                      value: c.email,
                    })) || []),
                    { label: '+ Add custom contact', value: '__custom__' },
                  ]}
                />
              </Form.Item>
              {isCustomContact && (
                <>
                  <Form.Item label="Contact Name">
                    <Input
                      value={customContactName}
                      onChange={(e) => setCustomContactName(e.target.value)}
                      placeholder="e.g. John Smith"
                    />
                  </Form.Item>
                  <Form.Item label="Contact Email">
                    <Input
                      value={customContactEmail}
                      onChange={(e) => setCustomContactEmail(e.target.value)}
                      placeholder="e.g. john@supplier.com"
                    />
                  </Form.Item>
                </>
              )}

              <Divider />

              {/* Section 2: Bill-to */}
              <Title level={5} style={{ marginBottom: 16 }}>
                Bill-to
              </Title>
              <Form.Item label="Legal Entity">
                <Select
                  value={billToEntityId}
                  onChange={(val) => setBillToEntityId(val)}
                  options={legalEntities.map((e) => ({
                    label: e.name,
                    value: e.id,
                  }))}
                />
              </Form.Item>
              <Form.Item label="Email">
                <Input
                  value={billToEmail}
                  onChange={(e) => setBillToEmail(e.target.value)}
                  placeholder="e.g. finance@axmed.com"
                />
              </Form.Item>

              <Divider />

              {/* Section 3: Ship-to */}
              <Title level={5} style={{ marginBottom: 16 }}>
                Ship-to
              </Title>
              <Form.Item label="Ship-to Name">
                <Select
                  value={shipToName}
                  onChange={(val) => setShipToName(val)}
                  options={shipToOptions}
                />
              </Form.Item>
              <Form.Item label="Delivery Address">
                <Input
                  value={`${po.shipToAddress}, ${po.shipToCity}, ${po.shipToCountry}`}
                  readOnly
                  variant="filled"
                />
              </Form.Item>

              <Divider />

              {/* Section 4: PO Details */}
              <Title level={5} style={{ marginBottom: 16 }}>
                PO Details
              </Title>
              <Form.Item label="Payment Terms">
                <Select
                  value={terms}
                  onChange={(val) => setTerms(val)}
                  options={paymentTerms.map((t) => ({
                    label: t,
                    value: t,
                  }))}
                />
              </Form.Item>
              <Form.Item label="Date">
                <Input
                  value={poDate.format('DD MMM YYYY')}
                  readOnly
                  variant="filled"
                />
              </Form.Item>
              <Form.Item label="Currency">
                <Select
                  value={currency}
                  onChange={(val) => setCurrency(val)}
                  options={currencyOptions}
                />
              </Form.Item>

              <Divider />

              {/* Section 5: Display Options */}
              <Title level={5} style={{ marginBottom: 16 }}>
                Display Options
              </Title>
              <Form.Item label="Quantity Display">
                <Space>
                  <Text type={!displayAsPacks ? undefined : 'secondary'}>
                    Units
                  </Text>
                  <Switch
                    checked={displayAsPacks}
                    onChange={(checked) => setDisplayAsPacks(checked)}
                  />
                  <Text type={displayAsPacks ? undefined : 'secondary'}>
                    Packs
                  </Text>
                </Space>
              </Form.Item>

              <Divider />

              {/* Section 6: VAT */}
              <Title level={5} style={{ marginBottom: 16 }}>
                VAT
              </Title>
              <Text
                type="secondary"
                style={{ display: 'block', marginBottom: 12 }}
              >
                Set by finance team
              </Text>
              <Form.Item label="VAT Percentage">
                <InputNumber
                  value={vatPercent}
                  onChange={(val) => setVatPercent(val || 0)}
                  min={0}
                  max={100}
                  addonAfter="%"
                  style={{ width: 160 }}
                />
              </Form.Item>
            </Form>
          </div>
        )}
        </div>

        {/* Right Column — Document Preview */}
        {(!isReadOnly || previewOpen) && (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {isReadOnly && (
              <Alert
                message="This PO has been submitted and cannot be edited."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}
            <div style={isReadOnly ? { zoom: 0.65 } : undefined}>
              <PODocumentPreview
                po={po}
                status={status}
                supplierName={po.supplier}
                supplierAddress={supplierOrg?.address || 'N/A'}
                vendorContact={isCustomContact ? customContactName : (selectedContact?.name || '')}
                vendorEmail={isCustomContact ? customContactEmail : (selectedContact?.email || '')}
                billToEntity={billToEntity?.name || ''}
                billToAddress={billToEntity?.address || ''}
                billToEmail={billToEmail}
                shipToEntity={shipToName}
                shipToAddress={`${po.shipToAddress}, ${po.shipToCity}, ${po.shipToCountry}`}
                poNumber={po.poNumber}
                paymentTerms={terms}
                referenceNumber={po.referenceNumber}
                date={poDate.format('DD MMM YYYY')}
                currency={currency}
                incoterms={po.incoterm}
                displayAsPacks={displayAsPacks}
                vatPercent={vatPercent}
                subtotal={subtotal}
                vatAmount={vatAmount}
                grandTotal={grandTotal}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ Line Item Status Panel ============

/** Splits "Amoxicillin 500mg Capsules" → { name: "Amoxicillin", presentation: "500mg Capsules" } */
function splitProductName(product: string): { name: string; presentation: string } {
  const match = product.match(/^(.+?)\s+(\d.+)$/);
  if (match) return { name: match[1], presentation: match[2] };
  return { name: product, presentation: '' };
}

type LineItemStatus = NonNullable<POLineItem['status']>;

const lineItemStatusConfig: Record<LineItemStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'default' },
  confirmed: { label: 'Confirmed', color: 'green' },
  partially_confirmed: { label: 'Partially Confirmed', color: 'gold' },
  rejected: { label: 'Withdrawn', color: 'red' },
};

function LineItemStatusPanel({ lineItems, currency, vatPercent }: { lineItems: POLineItem[]; currency: string; vatPercent: number }) {
  const fmt = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount);

  const isConfirmedStatus = (s?: POLineItem['status']) =>
    s === 'confirmed' || s === 'partially_confirmed';

  const confirmedSubtotal = lineItems.reduce((sum, item) => {
    if (!isConfirmedStatus(item.status) || item.confirmedQuantity == null) return sum;
    return sum + item.confirmedQuantity * item.unitPrice;
  }, 0);

  const anyConfirmed = lineItems.some((item) => isConfirmedStatus(item.status));
  const vatAmount = confirmedSubtotal * (vatPercent / 100);
  const confirmedGrandTotal = confirmedSubtotal + vatAmount;

  const columns: ColumnsType<POLineItem> = [
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
      render: (text: string) => {
        const { name, presentation } = splitProductName(text);
        return (
          <div>
            <Text strong style={{ fontSize: 13 }}>{name}</Text>
            {presentation && (
              <>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>{presentation}</Text>
              </>
            )}
          </div>
        );
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>{text}</Text>
      ),
    },
    {
      title: 'Ordered qty',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 110,
      align: 'right',
      render: (qty: number) => qty.toLocaleString(),
    },
    {
      title: 'Confirmed qty',
      key: 'confirmedQuantity',
      width: 120,
      align: 'right',
      render: (_: unknown, record: POLineItem) => {
        if (!isConfirmedStatus(record.status)) return <Text type="secondary">—</Text>;
        return record.confirmedQuantity?.toLocaleString() ?? '—';
      },
    },
    {
      title: 'Rate',
      key: 'unitPrice',
      width: 100,
      align: 'right',
      render: (_: unknown, record: POLineItem) => fmt(record.unitPrice),
    },
    {
      title: 'Confirmed total',
      key: 'confirmedTotal',
      width: 140,
      align: 'right',
      render: (_: unknown, record: POLineItem) => {
        if (!isConfirmedStatus(record.status) || record.confirmedQuantity == null) {
          return <Text type="secondary">—</Text>;
        }
        return <Text strong>{fmt(record.confirmedQuantity * record.unitPrice)}</Text>;
      },
    },
    {
      title: 'Status',
      key: 'status',
      width: 160,
      render: (_: unknown, record: POLineItem) => {
        if (!record.status) return <Tag>—</Tag>;
        const cfg = lineItemStatusConfig[record.status];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
  ];

  return (
    <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
      <Title level={5} style={{ marginBottom: 16 }}>Accounts Payable</Title>
      <Table<POLineItem>
        columns={columns}
        dataSource={lineItems}
        rowKey="id"
        pagination={false}
        bordered
        size="small"
        footer={() => (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Text type="secondary" style={{ fontSize: 13 }}>Confirmed subtotal:</Text>
              <Text style={{ fontSize: 13, minWidth: 100, textAlign: 'right' }}>
                {anyConfirmed ? fmt(confirmedSubtotal) : '—'}
              </Text>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Text type="secondary" style={{ fontSize: 13 }}>VAT ({vatPercent}%):</Text>
              <Text style={{ fontSize: 13, minWidth: 100, textAlign: 'right' }}>
                {anyConfirmed ? fmt(vatAmount) : '—'}
              </Text>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', borderTop: '1px solid #d9d9d9', paddingTop: 4, marginTop: 2 }}>
              <Text type="secondary" style={{ fontSize: 13 }}>Confirmed total:</Text>
              <Text strong style={{ fontSize: 14, minWidth: 100, textAlign: 'right' }}>
                {anyConfirmed ? fmt(confirmedGrandTotal) : '—'}
              </Text>
            </div>
          </div>
        )}
      />
    </div>
  );
}

// ============ PO Document Preview Component ============

interface PODocumentPreviewProps {
  po: PurchaseOrder;
  status: POStatus;
  supplierName: string;
  supplierAddress: string;
  vendorContact: string;
  vendorEmail: string;
  billToEntity: string;
  billToAddress: string;
  billToEmail: string;
  shipToEntity: string;
  shipToAddress: string;
  poNumber: string;
  paymentTerms: string;
  referenceNumber: string;
  date: string;
  currency: string;
  incoterms: string;
  displayAsPacks: boolean;
  vatPercent: number;
  subtotal: number;
  vatAmount: number;
  grandTotal: number;
}

function PODocumentPreview({
  po,
  supplierName,
  supplierAddress,
  vendorContact,
  vendorEmail,
  billToEntity,
  billToAddress,
  billToEmail,
  shipToEntity,
  shipToAddress,
  poNumber,
  paymentTerms: terms,
  referenceNumber,
  date,
  currency,
  incoterms,
  displayAsPacks,
  vatPercent,
  subtotal,
  vatAmount,
  grandTotal,
}: PODocumentPreviewProps) {
  const quantityLabel = displayAsPacks ? '(packs)' : '(units)';

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e8e8e8',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        borderRadius: 4,
        maxWidth: '100%',
        margin: '0 auto',
        overflow: 'hidden',
      }}
    >
      {/* Purple strip */}
      <div style={{ height: 6, background: '#392AB0' }} />

      {/* Document body */}
      <div style={{ padding: 40 }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 32,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: '#392AB0',
                margin: 0,
                letterSpacing: 1,
              }}
            >
              PURCHASE ORDER
            </h1>
          </div>
          <img
            src={`${import.meta.env.BASE_URL}axmed-logo.png`}
            alt="Axmed"
            style={{ height: 36 }}
          />
        </div>

        {/* Vendor & Bill-to */}
        <div
          style={{
            display: 'flex',
            gap: 32,
            marginBottom: 24,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={sectionHeaderStyle}>Vendor</div>
            <div style={docFieldStyle}>
              <strong>{supplierName}</strong>
            </div>
            <div style={docFieldStyle}>{supplierAddress}</div>
            {vendorContact && (
              <div style={docFieldStyle}>Contact: {vendorContact}</div>
            )}
            {vendorEmail && (
              <div style={docFieldStyle}>Email: {vendorEmail}</div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={sectionHeaderStyle}>Bill To</div>
            <div style={docFieldStyle}>
              <strong>{billToEntity}</strong>
            </div>
            <div style={docFieldStyle}>{billToAddress}</div>
            {billToEmail && (
              <div style={docFieldStyle}>Email: {billToEmail}</div>
            )}
          </div>
        </div>

        {/* Ship-to & PO Details */}
        <div
          style={{
            display: 'flex',
            gap: 32,
            marginBottom: 32,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={sectionHeaderStyle}>Ship To</div>
            <div style={docFieldStyle}>
              <strong>{shipToEntity}</strong>
            </div>
            <div style={docFieldStyle}>{shipToAddress}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={sectionHeaderStyle}>PO Details</div>
            <table style={{ fontSize: 13, lineHeight: 1.8 }}>
              <tbody>
                <tr>
                  <td style={detailLabelStyle}>PO #:</td>
                  <td>{poNumber}</td>
                </tr>
                <tr>
                  <td style={detailLabelStyle}>Terms:</td>
                  <td>{terms}</td>
                </tr>
                <tr>
                  <td style={detailLabelStyle}>Reference:</td>
                  <td>{referenceNumber}</td>
                </tr>
                <tr>
                  <td style={detailLabelStyle}>Date:</td>
                  <td>{date}</td>
                </tr>
                <tr>
                  <td style={detailLabelStyle}>Currency:</td>
                  <td>{currency}</td>
                </tr>
                <tr>
                  <td style={detailLabelStyle}>Incoterms:</td>
                  <td>{incoterms}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Items Table */}
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 13,
            marginBottom: 24,
          }}
        >
          <thead>
            <tr style={{ background: '#f8f8fc' }}>
              <th style={thStyle}>Product</th>
              <th style={thStyle}>Description</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>
                Quantity {quantityLabel}
              </th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Rate</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {po.lineItems.map((item) => {
              const qty = displayAsPacks && item.packSize > 0
                ? Math.ceil(item.quantity / item.packSize)
                : item.quantity;
              const rate = displayAsPacks && item.packSize > 0
                ? item.packPrice
                : item.unitPrice;
              return (
                <tr key={item.id}>
                  <td style={tdStyle}>{item.product}</td>
                  <td style={tdStyle}>
                    {item.description}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    {qty.toLocaleString()}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    {formatCurrency(rate, currency)}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    {formatCurrency(item.amount, currency)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td
                colSpan={4}
                style={{
                  ...tdStyle,
                  textAlign: 'right',
                  fontWeight: 500,
                }}
              >
                Subtotal
              </td>
              <td
                style={{
                  ...tdStyle,
                  textAlign: 'right',
                  fontWeight: 500,
                }}
              >
                {formatCurrency(subtotal, currency)}
              </td>
            </tr>
            <tr>
              <td
                colSpan={4}
                style={{
                  ...tdStyle,
                  textAlign: 'right',
                  color: '#888',
                }}
              >
                VAT ({vatPercent}%)
              </td>
              <td
                style={{
                  ...tdStyle,
                  textAlign: 'right',
                  color: '#888',
                }}
              >
                {formatCurrency(vatAmount, currency)}
              </td>
            </tr>
            <tr>
              <td
                colSpan={4}
                style={{
                  ...tdStyle,
                  textAlign: 'right',
                  fontWeight: 700,
                  fontSize: 14,
                  borderTop: '2px solid #392AB0',
                }}
              >
                Total
              </td>
              <td
                style={{
                  ...tdStyle,
                  textAlign: 'right',
                  fontWeight: 700,
                  fontSize: 14,
                  borderTop: '2px solid #392AB0',
                }}
              >
                {formatCurrency(grandTotal, currency)}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Notes */}
        <div style={{ marginTop: 32 }}>
          <div style={sectionHeaderStyle}>Notes</div>
          <div
            style={{
              fontSize: 11,
              color: '#888',
              lineHeight: 1.6,
              marginBottom: 16,
            }}
          >
            This purchase order is governed by Axmed's standard supply terms
            and conditions. By accepting this purchase order, the supplier
            agrees to be bound by these terms and conditions, which are
            available upon request. This PO is subject to the laws of the
            jurisdiction of the buying entity specified above.
          </div>
          <div
            style={{
              fontSize: 11,
              color: '#888',
              lineHeight: 1.6,
            }}
          >
            By accepting this Purchase Order, the Supplier confirms the
            following: (1) Acceptance of this PO constitutes a binding
            agreement to supply the listed products at the stated prices and
            terms. (2) All invoices must reference the PO number and be sent
            to the billing address above. (3) Products must have a minimum
            remaining shelf life of 75% at the time of delivery unless
            otherwise agreed in writing. (4) All products must be packaged
            in accordance with WHO guidelines and applicable regulatory
            requirements for the destination country. (5) The Supplier shall
            provide Certificates of Analysis, Certificates of
            Pharmaceutical Product (CoPP), and any other documentation
            required for importation prior to or at the time of shipment.
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ Shared Styles ============

const sectionHeaderStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  color: '#392AB0',
  letterSpacing: 0.8,
  marginBottom: 6,
  borderBottom: '1px solid #e8e8e8',
  paddingBottom: 4,
};

const docFieldStyle: React.CSSProperties = {
  fontSize: 13,
  lineHeight: 1.7,
  color: '#333',
};

const detailLabelStyle: React.CSSProperties = {
  color: '#888',
  paddingRight: 12,
  fontWeight: 500,
  whiteSpace: 'nowrap',
};

const thStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderBottom: '2px solid #392AB0',
  textAlign: 'left',
  fontWeight: 600,
  color: '#333',
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
};

const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderBottom: '1px solid #f0f0f0',
  verticalAlign: 'top',
};
