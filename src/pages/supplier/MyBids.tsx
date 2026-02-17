import { useState } from 'react';
import { Typography, Button, Input, Tabs, Table, Tag, Space, Tooltip } from 'antd';
import { SearchOutlined, DownloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { supplierBids, supplierAwards } from '../../data/mockData';
import type { SupplierBid } from '../../data/mockData';
import SupplierAwards from './Awards';

const { Title, Text } = Typography;

type BidStatus = SupplierBid['status'];

const statusConfig: Record<BidStatus, { label: string; color: string }> = {
  submitted: { label: 'Submitted', color: 'blue' },
  in_buyer_review: { label: 'In Buyer Review', color: 'orange' },
  awarded: { label: 'Awarded', color: 'green' },
  confirmed: { label: 'Confirmed', color: 'cyan' },
  not_awarded: { label: 'Not Awarded', color: 'default' },
  withdrawn: { label: 'Withdrawn', color: 'red' },
};

const formatCurrency = (amount: number, currency: string) => {
  const symbol = currency === 'USD' ? '$' : currency;
  return `${symbol}${amount.toLocaleString()}`;
};

export default function SupplierMyBids() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');

  const filteredBids = supplierBids.filter(
    (bid) =>
      !searchText ||
      bid.medicationName.toLowerCase().includes(searchText.toLowerCase()) ||
      bid.description.toLowerCase().includes(searchText.toLowerCase()),
  );

  const byStatus = (status: BidStatus | 'all') =>
    status === 'all' ? filteredBids : filteredBids.filter((b) => b.status === status);

  const bidColumns = (showStatus: boolean): ColumnsType<SupplierBid> => [
    {
      title: 'Medication',
      key: 'medication',
      render: (_, record) => (
        <div>
          <Text strong>{record.medicationName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.description}</Text>
        </div>
      ),
    },
    {
      title: 'Total volume',
      key: 'totalVolume',
      width: 180,
      render: (_, record) => (
        <span>
          {record.totalVolume.toLocaleString()}{' '}
          <Text type="secondary" style={{ fontSize: 12 }}>{record.volumeUnit}</Text>
        </span>
      ),
    },
    {
      title: 'Pack size',
      dataIndex: 'packSize',
      key: 'packSize',
      width: 100,
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
    ...(showStatus
      ? [
          {
            title: 'Status',
            key: 'status',
            width: 150,
            render: (_: unknown, record: SupplierBid) => {
              const cfg = statusConfig[record.status];
              return <Tag color={cfg.color}>{cfg.label}</Tag>;
            },
          },
        ]
      : []),
    {
      title: '',
      key: 'actions',
      width: 110,
      render: () => <Button size="small">View more</Button>,
    },
  ];

  const bidTable = (data: SupplierBid[], showStatus: boolean) => (
    <Table<SupplierBid>
      columns={bidColumns(showStatus)}
      dataSource={data}
      rowKey="id"
      pagination={false}
      bordered
      size="middle"
      style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      footer={() => (
        <div style={{ textAlign: 'center', color: '#999', fontSize: 13, padding: '4px 0' }}>
          No more data to load
        </div>
      )}
    />
  );

  const awardCount = (statuses: string[]) =>
    supplierAwards.filter((a) => statuses.includes(a.status)).length;

  const bidTabCount = (status: BidStatus | 'all') =>
    status === 'all' ? filteredBids.length : byStatus(status).length;

  return (
    <div style={{ padding: 24, background: '#fff', borderRadius: 8, minHeight: '100%' }}>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <Title level={4} style={{ marginBottom: 0 }}>Track Your Bids</Title>
        <Space>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search for medicine"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 240 }}
            allowClear
          />
          <Button icon={<DownloadOutlined />}>Export to xls</Button>
        </Space>
      </div>
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        Stay updated on the status of each bid, from submission to confirmation of supply.
      </Text>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'all',
            label: `All(${bidTabCount('all')})`,
            children: bidTable(byStatus('all'), true),
          },
          {
            key: 'submitted',
            label: `Submitted(${bidTabCount('submitted')})`,
            children: bidTable(byStatus('submitted'), false),
          },
          {
            key: 'in_buyer_review',
            label: `In Buyer Review(${bidTabCount('in_buyer_review')})`,
            children: bidTable(byStatus('in_buyer_review'), false),
          },
          {
            key: 'awarded',
            label: `Awarded(${awardCount(['pending_confirmation'])})`,
            children: <SupplierAwards filterStatuses={['pending_confirmation']} />,
          },
          {
            key: 'confirmed',
            label: `Confirmed(${awardCount(['confirmed', 'partially_confirmed'])})`,
            children: <SupplierAwards filterStatuses={['confirmed', 'partially_confirmed']} />,
          },
          {
            key: 'not_awarded',
            label: `Not awarded(${bidTabCount('not_awarded')})`,
            children: bidTable(byStatus('not_awarded'), false),
          },
          {
            key: 'withdrawn',
            label: `Withdrawn(${awardCount(['withdrawn'])})`,
            children: <SupplierAwards filterStatuses={['withdrawn']} />,
          },
        ]}
      />
    </div>
  );
}
