import { useState, useMemo } from 'react';
import {
  Typography,
  Table,
  Tag,
  Button,
  Drawer,
  Card,
  Input,
  Select,
  Collapse,
  Descriptions,
  message,
  Tooltip,
  Space,
} from 'antd';
import { SearchOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { TableRowSelection, ColumnsType } from 'antd/es/table/interface';
import {
  orderItems,
  groupOrderItemsIntoDraftPOs,
} from '../data/mockData';
import type { OrderItem, DraftPOGroup } from '../data/mockData';

const { Title, Text } = Typography;

const statusConfig: Record<string, { color: string; label: string }> = {
  po_submitted: { color: 'green', label: 'PO Submitted' },
  quotation_selected: { color: 'gold', label: 'Quotation Selected' },
  quotation_ready: { color: 'blue', label: 'Quotation Ready' },
  under_review: { color: 'orange', label: 'Under Review' },
  pending: { color: 'default', label: 'Pending' },
};

const formatCurrency = (value: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);
};

function BuyerEvaluation() {
  const navigate = useNavigate();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [cycleFilter, setCycleFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  // Derive unique cycle options from data
  const cycleOptions = useMemo(() => {
    const unique = Array.from(new Set(orderItems.map((item) => item.cycleName)));
    return unique.map((name) => ({ label: name, value: name }));
  }, []);

  // Derive unique status options from data
  const statusOptions = useMemo(() => {
    const unique = Array.from(new Set(orderItems.map((item) => item.status)));
    return unique.map((s) => ({
      label: statusConfig[s]?.label ?? s,
      value: s,
    }));
  }, []);

  // Filter data
  const filteredData = useMemo(() => {
    return orderItems.filter((item) => {
      const matchesSearch =
        !searchText ||
        item.productName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.orderNumber.toLowerCase().includes(searchText.toLowerCase());
      const matchesCycle = !cycleFilter || item.cycleName === cycleFilter;
      const matchesStatus = !statusFilter || item.status === statusFilter;
      return matchesSearch && matchesCycle && matchesStatus;
    });
  }, [searchText, cycleFilter, statusFilter]);

  // Selected items for draft PO
  const selectedItems = useMemo(() => {
    return orderItems.filter((item) => selectedRowKeys.includes(item.id));
  }, [selectedRowKeys]);

  // Draft PO groups
  const draftPOGroups = useMemo<DraftPOGroup[]>(() => {
    if (selectedItems.length === 0) return [];
    return groupOrderItemsIntoDraftPOs(selectedItems);
  }, [selectedItems]);

  // Grand total across all groups
  const grandTotal = useMemo(() => {
    return draftPOGroups.reduce((sum, group) => sum + group.totalValue, 0);
  }, [draftPOGroups]);

  // Table columns
  const columns: ColumnsType<OrderItem> = [
    {
      title: 'Order #',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 140,
      sorter: (a, b) => a.orderNumber.localeCompare(b.orderNumber),
    },
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName',
      width: 260,
      ellipsis: true,
    },
    {
      title: 'Supplier',
      dataIndex: 'selectedSupplier',
      key: 'selectedSupplier',
      width: 160,
      filters: Array.from(new Set(orderItems.map((i) => i.selectedSupplier))).map((s) => ({
        text: s,
        value: s,
      })),
      onFilter: (value, record) => record.selectedSupplier === value,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'right',
      render: (qty: number) => qty.toLocaleString(),
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      align: 'right',
      render: (price: number, record) => formatCurrency(price, record.currency),
      sorter: (a, b) => a.unitPrice - b.unitPrice,
    },
    {
      title: 'Total',
      key: 'total',
      width: 130,
      align: 'right',
      render: (_, record) =>
        formatCurrency(record.quantity * record.unitPrice, record.currency),
      sorter: (a, b) =>
        a.quantity * a.unitPrice - b.quantity * b.unitPrice,
    },
    {
      title: 'Incoterms',
      key: 'incoterms',
      width: 150,
      render: (_, record) => `${record.incoterm} ${record.incotermLocation}`,
    },
    {
      title: 'Ship-to',
      key: 'shipTo',
      width: 150,
      render: (_, record) => `${record.shipToCity}, ${record.shipToCountry}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 160,
      render: (status: string) => {
        const config = statusConfig[status] ?? { color: 'default', label: status };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Buyer PO #',
      dataIndex: 'buyerPoNumber',
      key: 'buyerPoNumber',
      width: 140,
      render: (val: string) => val || <Text type="secondary">--</Text>,
    },
  ];

  // Row selection config
  const rowSelection: TableRowSelection<OrderItem> = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
    getCheckboxProps: (record) => ({
      disabled: record.status !== 'po_submitted',
    }),
    renderCell: (_checked, record, _index, originNode) => {
      if (record.status !== 'po_submitted') {
        return (
          <Tooltip title="Only PO Submitted items can be selected">
            {originNode}
          </Tooltip>
        );
      }
      return originNode;
    },
  };

  const handleInitiateDraftPO = () => {
    setDrawerOpen(true);
  };

  const handleCreateDraftPOs = () => {
    message.success(
      `Successfully created ${draftPOGroups.length} draft PO${draftPOGroups.length > 1 ? 's' : ''}! Redirecting to Finance...`
    );
    setDrawerOpen(false);
    setSelectedRowKeys([]);
    setTimeout(() => {
      navigate('/finance/purchase-orders');
    }, 600);
  };

  return (
    <div
      style={{
        padding: 24,
        background: '#fff',
        borderRadius: 8,
        minHeight: 'calc(100vh - 48px)',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          Buyer Evaluation
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Cycle 253 &mdash; Evaluation
        </Text>
      </div>

      {/* Search / Filter Bar */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        <Input
          placeholder="Search by product name or order number"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          style={{ width: 320 }}
        />
        <Select
          placeholder="Filter by cycle"
          options={cycleOptions}
          value={cycleFilter}
          onChange={(val) => setCycleFilter(val)}
          allowClear
          style={{ width: 180 }}
        />
        <Select
          placeholder="Filter by status"
          options={statusOptions}
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          allowClear
          style={{ width: 200 }}
        />
      </div>

      {/* Action Bar */}
      {selectedRowKeys.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            marginBottom: 16,
            background: '#f0ecfa',
            borderRadius: 8,
            border: '1px solid #d9d0f5',
          }}
        >
          <Text strong style={{ color: '#392AB0' }}>
            {selectedRowKeys.length} item{selectedRowKeys.length > 1 ? 's' : ''} selected
          </Text>
          <Button
            type="primary"
            icon={<FileTextOutlined />}
            onClick={handleInitiateDraftPO}
          >
            Initiate Draft PO
          </Button>
        </div>
      )}

      {/* Table */}
      <Table<OrderItem>
        rowKey="id"
        columns={columns}
        dataSource={filteredData}
        rowSelection={rowSelection}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `${total} items` }}
        scroll={{ x: 1400 }}
        size="middle"
        style={{ background: '#fff' }}
      />

      {/* Initiate Draft PO Drawer */}
      <Drawer
        title="Initiate Draft PO"
        placement="right"
        width={520}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        footer={
          <div style={{ padding: '12px 0' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}
            >
              <Text strong>Grand Total:</Text>
              <Text strong style={{ fontSize: 16 }}>
                {formatCurrency(grandTotal)}
              </Text>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <Text type="secondary">Number of POs to create:</Text>
              <Text strong>{draftPOGroups.length}</Text>
            </div>
            <Button
              type="primary"
              block
              size="large"
              onClick={handleCreateDraftPOs}
              icon={<FileTextOutlined />}
            >
              Create Draft POs
            </Button>
          </div>
        }
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
          Review the PO groupings below. Each card represents one draft PO.
        </Text>

        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {draftPOGroups.map((group, index) => (
            <Card
              key={`${group.supplier}-${group.incoterm}-${group.shipToCity}`}
              style={{
                borderRadius: 8,
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              }}
              styles={{ body: { padding: 16 } }}
            >
              <Text
                strong
                style={{
                  fontSize: 16,
                  display: 'block',
                  marginBottom: 12,
                }}
              >
                {group.supplier}
              </Text>

              <Descriptions
                column={1}
                size="small"
                colon={false}
                labelStyle={{ color: '#888', width: 100 }}
              >
                <Descriptions.Item label="Incoterms">
                  {group.incoterm} {group.incotermLocation}
                </Descriptions.Item>
                <Descriptions.Item label="Ship-to">
                  {group.shipToCity}, {group.shipToCountry}
                </Descriptions.Item>
                <Descriptions.Item label="# SKUs">
                  {group.items.length}
                </Descriptions.Item>
                <Descriptions.Item label="Total Value">
                  <Text strong>{formatCurrency(group.totalValue)}</Text>
                </Descriptions.Item>
              </Descriptions>

              <Collapse
                ghost
                size="small"
                style={{ marginTop: 8 }}
                items={[
                  {
                    key: `skus-${index}`,
                    label: (
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        View {group.items.length} SKU{group.items.length > 1 ? 's' : ''}
                      </Text>
                    ),
                    children: (
                      <div>
                        {group.items.map((item) => (
                          <div
                            key={item.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              padding: '4px 0',
                              borderBottom: '1px solid #f0f0f0',
                            }}
                          >
                            <Text
                              style={{ fontSize: 13 }}
                              ellipsis={{ tooltip: item.productName }}
                            >
                              {item.productName}
                            </Text>
                            <Text
                              type="secondary"
                              style={{ fontSize: 13, whiteSpace: 'nowrap', marginLeft: 8 }}
                            >
                              x {item.quantity.toLocaleString()}
                            </Text>
                          </div>
                        ))}
                      </div>
                    ),
                  },
                ]}
              />
            </Card>
          ))}
        </Space>
      </Drawer>
    </div>
  );
}

export default BuyerEvaluation;
