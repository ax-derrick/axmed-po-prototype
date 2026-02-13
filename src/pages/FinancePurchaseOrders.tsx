import { useState, useMemo } from 'react';
import {
  Card,
  Col,
  Row,
  Statistic,
  Table,
  Tag,
  Tabs,
  Badge,
  Input,
  Select,
  Space,
  Button,
  Dropdown,
  Popconfirm,
  Empty,
  message,
  Typography,
} from 'antd';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  FileTextOutlined,
  DollarOutlined,
  SearchOutlined,
  EllipsisOutlined,
  EyeOutlined,
  FilePdfOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { PurchaseOrder } from '../data/mockData';
import { usePOFlow } from '../context/POFlowContext';

type POStatus = PurchaseOrder['status'];

const { Title } = Typography;

// ============ STATUS CONFIG ============

const statusConfig: Record<POStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'blue' },
  cleared_by_commercial: { label: 'Cleared by Commercial', color: 'purple' },
  submitted: { label: 'Submitted', color: 'cyan' },
  confirmed: { label: 'Confirmed', color: 'green' },
  partially_confirmed: { label: 'Partially Confirmed', color: 'orange' },
};

const statusTabs: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'cleared_by_commercial', label: 'Cleared by Commercial' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'partially_confirmed', label: 'Partially Confirmed' },
];

// ============ FORMATTING HELPERS ============

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ============ ICON CIRCLE COMPONENT ============

function IconCircle({
  icon,
  color,
}: {
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        backgroundColor: `${color}14`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <span style={{ color, fontSize: 18 }}>{icon}</span>
    </div>
  );
}

// ============ MAIN COMPONENT ============

export default function FinancePurchaseOrders() {
  const navigate = useNavigate();

  // Shared PO state from context
  const { purchaseOrders: pos, deleteDraftPO } = usePOFlow();

  // Filter state
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cycleFilter, setCycleFilter] = useState<string>('all');

  // Derive unique cycles from data
  const cycleOptions = useMemo(() => {
    const cycles = Array.from(new Set(pos.map((po) => po.cycleName)));
    return [
      { value: 'all', label: 'All Cycles' },
      ...cycles.map((c) => ({ value: c, label: c })),
    ];
  }, [pos]);

  // Filtered data
  const filteredData = useMemo(() => {
    return pos.filter((po) => {
      const matchesSearch =
        searchText === '' ||
        po.poNumber.toLowerCase().includes(searchText.toLowerCase()) ||
        po.supplier.toLowerCase().includes(searchText.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || po.status === statusFilter;

      const matchesCycle =
        cycleFilter === 'all' || po.cycleName === cycleFilter;

      return matchesSearch && matchesStatus && matchesCycle;
    });
  }, [pos, searchText, statusFilter, cycleFilter]);

  // Summary statistics
  const stats = useMemo(() => {
    const totalPOs = pos.length;
    const totalValue = pos.reduce((sum, po) => sum + po.totalAmount, 0);
    return { totalPOs, totalValue };
  }, [pos]);

  // Per-status counts for tab badges
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: pos.length };
    for (const po of pos) {
      counts[po.status] = (counts[po.status] || 0) + 1;
    }
    return counts;
  }, [pos]);

  // Delete handler
  const handleDelete = (poId: string) => {
    deleteDraftPO(poId);
    message.success('Draft PO deleted. Items reverted to buyer evaluation.');
  };

  // Actions dropdown menu builder
  const getActionMenuItems = (record: PurchaseOrder): MenuProps['items'] => [
    {
      key: 'view-details',
      icon: <EyeOutlined />,
      label: 'View Details',
      onClick: () => navigate(`/finance/purchase-orders/${record.id}`),
    },
    {
      key: 'download-pdf',
      icon: <FilePdfOutlined />,
      label: 'Download PDF',
      onClick: () => message.info('PDF download coming soon.'),
    },
  ];

  // Table columns
  const columns: ColumnsType<PurchaseOrder> = [
    {
      title: 'PO Number',
      dataIndex: 'poNumber',
      key: 'poNumber',
      sorter: (a, b) => a.poNumber.localeCompare(b.poNumber),
      render: (text: string) => (
        <span style={{ fontWeight: 500 }}>{text}</span>
      ),
    },
    {
      title: 'Supplier',
      dataIndex: 'supplier',
      key: 'supplier',
    },
    {
      title: 'Cycle',
      dataIndex: 'cycleName',
      key: 'cycleName',
      render: (text: string) => (
        <a style={{ color: '#1890ff' }}>{text}</a>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (status: POStatus) => {
        const cfg = statusConfig[status];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      sorter: (a, b) => a.totalAmount - b.totalAmount,
      render: (amount: number) => (
        <span style={{ fontWeight: 500 }}>{formatCurrency(amount)}</span>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 220,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            style={{ fontWeight: 500 }}
            onClick={() => navigate(`/finance/purchase-orders/${record.id}`)}
          >
            Review
          </Button>

          {record.status === 'draft' && (
            <Popconfirm
              title="Delete this draft PO?"
              description="Items will be reverted to buyer evaluation."
              onConfirm={() => handleDelete(record.id)}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="link"
                danger
                size="small"
                icon={<DeleteOutlined />}
              >
                Delete
              </Button>
            </Popconfirm>
          )}

          <Dropdown
            menu={{ items: getActionMenuItems(record) }}
            trigger={['click']}
          >
            <Button
              type="text"
              size="small"
              icon={<EllipsisOutlined style={{ fontSize: 16 }} />}
            />
          </Dropdown>
        </Space>
      ),
    },
  ];

  // ============ RENDER ============

  return (
    <div style={{ padding: 24 }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, marginBottom: 4 }}>
          Purchase Orders
        </Title>
        <Typography.Text type="secondary">
          Manage and track all purchase orders across procurement cycles.
        </Typography.Text>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8} lg={6} xl={5}>
          <Card
            hoverable
            style={{
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
            styles={{ body: { padding: '20px 16px' } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <IconCircle icon={<FileTextOutlined />} color="#392AB0" />
              <Statistic
                title="Total POs"
                value={stats.totalPOs}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6} xl={5}>
          <Card
            hoverable
            style={{
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
            styles={{ body: { padding: '20px 16px' } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <IconCircle icon={<DollarOutlined />} color="#52c41a" />
              <Statistic
                title="Total Value"
                value={stats.totalValue}
                precision={0}
                prefix="$"
              />
            </div>
          </Card>
        </Col>

      </Row>

      {/* Tabs + Table Container */}
      <Card
        style={{
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
        styles={{ body: { padding: 0 } }}
      >
        {/* Status Tabs */}
        <Tabs
          activeKey={statusFilter}
          onChange={setStatusFilter}
          style={{ paddingLeft: 24, paddingRight: 24 }}
          items={statusTabs.map((tab) => ({
            key: tab.key,
            label: (
              <span>
                {tab.label}
                <Badge
                  count={statusCounts[tab.key] || 0}
                  style={{
                    marginLeft: 8,
                    backgroundColor: statusFilter === tab.key ? '#392AB0' : '#f0f0f0',
                    color: statusFilter === tab.key ? '#fff' : 'rgba(0,0,0,0.45)',
                    fontSize: 12,
                    boxShadow: 'none',
                  }}
                  overflowCount={999}
                />
              </span>
            ),
          }))}
        />

        {/* Filter Bar */}
        <div
          style={{
            padding: '12px 24px',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <Input
            placeholder="Search by PO number or supplier..."
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: 280 }}
          />
          <Select
            value={cycleFilter}
            onChange={setCycleFilter}
            options={cycleOptions}
            style={{ width: 220 }}
          />
        </div>

        {/* Table */}
        {filteredData.length === 0 ? (
          <div style={{ padding: '48px 24px' }}>
            <Empty description="No purchase orders match your filters." />
          </div>
        ) : (
          <Table<PurchaseOrder>
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} purchase orders`,
            }}
            style={{ overflow: 'auto' }}
          />
        )}
      </Card>
    </div>
  );
}
