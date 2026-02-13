import { useState, useMemo } from 'react';
import {
  Typography,
  Table,
  Tag,
  Button,
  Collapse,
  Space,
  Input,
  Select,
  DatePicker,
  Badge,
  message,
  Row,
  Col,
} from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { fulfillmentLocations } from '../../data/mockData';
import type { FulfillmentPO, FulfillmentLocation } from '../../data/mockData';

const { Title, Text } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string): string {
  return dayjs(dateStr).format('DD MMM YYYY');
}

type FulfillmentStatus = FulfillmentPO['status'];

const statusConfig: Record<FulfillmentStatus, { color: string; label: string }> = {
  confirmed: { color: 'green', label: 'Confirmed' },
  ready_for_pickup: { color: 'blue', label: 'Ready for Pickup' },
  collected: { color: 'purple', label: 'Collected' },
  invoiced: { color: 'default', label: 'Invoiced' },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SupplierFulfillment() {
  const [locations] = useState<FulfillmentLocation[]>(fulfillmentLocations);

  // Filter state
  const [searchPO, setSearchPO] = useState('');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  // Track which POs have been "viewed" (remove New badge)
  const [viewedPOs, setViewedPOs] = useState<Set<string>>(new Set());

  // Compute unique location options for the filter
  const locationOptions = useMemo(
    () =>
      fulfillmentLocations.map((loc) => ({
        label: `${loc.city}, ${loc.country}`,
        value: `${loc.city}-${loc.country}`,
      })),
    []
  );

  // ---------------------------------------------------------------------------
  // Filtering logic
  // ---------------------------------------------------------------------------

  const filteredLocations = useMemo(() => {
    let filtered = locations;

    // Filter by selected location IDs
    if (selectedLocations.length > 0) {
      filtered = filtered.filter((loc) => selectedLocations.includes(`${loc.city}-${loc.country}`));
    }

    // Filter POs within each location by search and date range
    return filtered
      .map((loc) => {
        let pos = [...loc.purchaseOrders];

        // Search by PO number
        if (searchPO.trim()) {
          const term = searchPO.trim().toLowerCase();
          pos = pos.filter((po) => po.poNumber.toLowerCase().includes(term));
        }

        // Date range filter
        if (dateRange && dateRange[0] && dateRange[1]) {
          const start = dateRange[0].startOf('day');
          const end = dateRange[1].endOf('day');
          pos = pos.filter((po) => {
            const d = dayjs(po.dateConfirmed);
            return d.isAfter(start) && d.isBefore(end);
          });
        }

        // Sort by dateConfirmed descending (newest first)
        pos.sort((a, b) => dayjs(b.dateConfirmed).valueOf() - dayjs(a.dateConfirmed).valueOf());

        // Recompute newCount based on viewed state
        const effectiveNewCount = pos.filter((po) => po.isNew && !viewedPOs.has(po.poNumber)).length;

        return {
          ...loc,
          purchaseOrders: pos,
          newCount: effectiveNewCount,
        };
      })
      .filter((loc) => loc.purchaseOrders.length > 0);
  }, [locations, searchPO, dateRange, selectedLocations, viewedPOs]);

  // Panels with "New" items expanded by default
  const defaultActiveKeys = useMemo(
    () => filteredLocations.filter((loc) => loc.newCount > 0).map((loc) => `${loc.city}-${loc.country}`),
    [filteredLocations]
  );

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const handleDownloadPO = (po: FulfillmentPO) => {
    // Mark as viewed
    setViewedPOs((prev) => new Set(prev).add(po.poNumber));
    message.success(`Downloading ${po.poNumber}...`);
  };

  const handleUploadInvoice = (po: FulfillmentPO) => {
    message.info(`Upload invoice dialog for ${po.poNumber} — not yet implemented`);
  };

  const handleDownloadAllZip = (loc: FulfillmentLocation) => {
    // Mark all POs in this location as viewed
    setViewedPOs((prev) => {
      const next = new Set(prev);
      loc.purchaseOrders.forEach((po) => next.add(po.poNumber));
      return next;
    });
    message.success(`Downloading all POs for ${loc.city}, ${loc.country} as ZIP...`);
  };

  // ---------------------------------------------------------------------------
  // Fulfillment PO table columns
  // ---------------------------------------------------------------------------

  const poColumns: ColumnsType<FulfillmentPO> = [
    {
      title: 'Date Confirmed',
      dataIndex: 'dateConfirmed',
      key: 'dateConfirmed',
      width: 140,
      render: (d: string) => formatDate(d),
    },
    {
      title: 'PO #',
      dataIndex: 'poNumber',
      key: 'poNumber',
      width: 200,
      render: (text: string, record) => (
        <Space>
          <Text code>{text}</Text>
          {record.isNew && !viewedPOs.has(record.poNumber) && (
            <Tag color="orange" style={{ fontSize: 10 }}>
              NEW
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: '# of SKUs',
      dataIndex: 'skuCount',
      key: 'skuCount',
      width: 100,
      align: 'center',
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      width: 130,
      align: 'right',
      render: (v: number, record) => formatCurrency(v, record.currency),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: FulfillmentStatus) => {
        const cfg = statusConfig[status];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Incoterm',
      dataIndex: 'incotermSpec',
      key: 'incotermSpec',
      width: 90,
      align: 'center',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Ship-To',
      dataIndex: 'shipTo',
      key: 'shipTo',
      width: 180,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 240,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadPO(record)}
          >
            Download PO
          </Button>
          <Button
            size="small"
            icon={<UploadOutlined />}
            onClick={() => handleUploadInvoice(record)}
          >
            Upload Invoice
          </Button>
        </Space>
      ),
    },
  ];

  // ---------------------------------------------------------------------------
  // Build Collapse items
  // ---------------------------------------------------------------------------

  const collapseItems = filteredLocations.map((loc) => ({
    key: `${loc.city}-${loc.country}`,
    label: (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <Text strong style={{ fontSize: 15 }}>
          {loc.city}, {loc.country}
        </Text>
        <Space size="middle">
          {loc.newCount > 0 && (
            <Badge
              count={`${loc.newCount} New`}
              style={{ backgroundColor: '#fa8c16' }}
            />
          )}
          <Button
            size="small"
            icon={<DownloadOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleDownloadAllZip(loc);
            }}
          >
            Download All POs (ZIP)
          </Button>
        </Space>
      </div>
    ),
    children: (
      <Table<FulfillmentPO>
        columns={poColumns}
        dataSource={loc.purchaseOrders}
        rowKey="poNumber"
        pagination={false}
        bordered
        size="small"
      />
    ),
  }));

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div style={{ padding: 24, background: '#fff', borderRadius: 8, minHeight: '100%' }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ marginBottom: 4 }}>
          Fulfillment
        </Title>
        <Text type="secondary">Confirmed purchase orders grouped by ship-from location</Text>
      </div>

      {/* Global Filter Bar */}
      <div
        style={{
          background: '#fafafa',
          padding: 16,
          borderRadius: 8,
          marginBottom: 24,
          border: '1px solid #f0f0f0',
        }}
      >
        <Row gutter={16} align="middle">
          <Col flex="280px">
            <Search
              placeholder="Search by PO number"
              allowClear
              value={searchPO}
              onChange={(e) => setSearchPO(e.target.value)}
              onSearch={(val) => setSearchPO(val)}
            />
          </Col>
          <Col flex="280px">
            <RangePicker
              style={{ width: '100%' }}
              value={dateRange as [Dayjs, Dayjs] | null}
              onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
              placeholder={['From date', 'To date']}
            />
          </Col>
          <Col flex="auto">
            <Select
              mode="multiple"
              placeholder="Filter by location"
              style={{ width: '100%' }}
              value={selectedLocations}
              onChange={(val) => setSelectedLocations(val)}
              options={locationOptions}
              allowClear
              maxTagCount="responsive"
            />
          </Col>
        </Row>
      </div>

      {/* Location Accordion */}
      {filteredLocations.length > 0 ? (
        <Collapse
          defaultActiveKey={defaultActiveKeys}
          items={collapseItems}
          style={{
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
        />
      ) : (
        <div
          style={{
            padding: 48,
            textAlign: 'center',
            color: '#8c8c8c',
            background: '#fafafa',
            borderRadius: 8,
          }}
        >
          <Text type="secondary">No purchase orders match your filters.</Text>
        </div>
      )}
    </div>
  );
}
