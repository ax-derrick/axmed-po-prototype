import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  TagOutlined,
  NodeIndexOutlined,
  MedicineBoxOutlined,
  DollarOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import './App.css';

// Lazy imports for real pages (will be created separately)
import BuyerEvaluation from './pages/BuyerEvaluation';
import FinancePurchaseOrders from './pages/FinancePurchaseOrders';
import POReview from './pages/POReview';
import SupplierMyBids from './pages/supplier/MyBids';
import SupplierFulfillment from './pages/supplier/Fulfillment';

const { Header, Sider, Content } = Layout;

// ---------------------------------------------------------------------------
// Placeholder component for pages that don't exist yet
// ---------------------------------------------------------------------------
function Placeholder({ title }: { title: string }) {
  return (
    <div className="placeholder-page">
      <h2>{title}</h2>
      <p>Coming soon</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar menu configuration
// ---------------------------------------------------------------------------
type MenuItem = Required<MenuProps>['items'][number];

const menuItems: MenuItem[] = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: 'tender-cycles',
    icon: <AppstoreOutlined />,
    label: 'Tender Cycles',
    children: [
      { key: '/cycles', label: 'Cycle Information' },
    ],
  },
  {
    key: 'buyers',
    icon: <ShoppingOutlined />,
    label: 'Buyers',
    children: [
      { key: '/buyers/orders', label: 'Orders' },
      { key: '/buyers/order-items', label: 'Order Items' },
      { key: '/buyer-evaluation', label: 'Buyer Evaluation' },
      { key: '/buyers/organizations', label: 'Organizations' },
      { key: '/buyers/users', label: 'Users' },
    ],
  },
  {
    key: 'suppliers',
    icon: <TagOutlined />,
    label: 'Suppliers',
    children: [
      { key: '/suppliers/organizations', label: 'Organizations' },
      { key: '/suppliers/users', label: 'Users' },
      { key: '/suppliers/quotations', label: 'Quotations' },
      { key: '/supplier/my-bids', label: 'My Bids' },
      { key: '/supplier/fulfillment', label: 'Fulfillment' },
    ],
  },
  {
    key: 'supply-chain',
    icon: <NodeIndexOutlined />,
    label: 'Supply Chain',
  },
  {
    key: 'medicine-catalogue',
    icon: <MedicineBoxOutlined />,
    label: 'Medicine Catalogue',
    children: [
      { key: '/catalogue/skus', label: 'SKUs' },
      { key: '/catalogue/sku-categories', label: 'SKU Categories' },
      { key: '/catalogue/inns', label: 'INNs' },
      { key: '/catalogue/therapy-areas', label: 'Therapy Areas' },
    ],
  },
  {
    key: 'finance',
    icon: <DollarOutlined />,
    label: 'Finance',
    children: [
      { key: '/finance/purchase-orders', label: 'Purchase Orders' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helper: determine which menu keys should be open/selected based on path
// ---------------------------------------------------------------------------
function getSelectedKeys(pathname: string): string[] {
  return [pathname];
}

function getOpenKeys(pathname: string): string[] {
  const map: Record<string, string> = {
    '/cycles': 'tender-cycles',
    '/buyers/orders': 'buyers',
    '/buyers/order-items': 'buyers',
    '/buyer-evaluation': 'buyers',
    '/buyers/organizations': 'buyers',
    '/buyers/users': 'buyers',
    '/suppliers/organizations': 'suppliers',
    '/suppliers/users': 'suppliers',
    '/suppliers/quotations': 'suppliers',
    '/supplier/my-bids': 'suppliers',
    '/supplier/fulfillment': 'suppliers',
    '/catalogue/skus': 'medicine-catalogue',
    '/catalogue/sku-categories': 'medicine-catalogue',
    '/catalogue/inns': 'medicine-catalogue',
    '/catalogue/therapy-areas': 'medicine-catalogue',
    '/finance/purchase-orders': 'finance',
  };

  const parent = map[pathname];
  return parent ? [parent] : [];
}

// ---------------------------------------------------------------------------
// App Component
// ---------------------------------------------------------------------------
function App() {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sidebarCollapsed') === 'true'
  );
  const navigate = useNavigate();
  const location = useLocation();

  const [openKeys, setOpenKeys] = useState<string[]>(
    getOpenKeys(location.pathname)
  );

  const handleCollapse = (value: boolean) => {
    setCollapsed(value);
    localStorage.setItem('sidebarCollapsed', String(value));
  };

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
  };

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  return (
    <Layout className="admin-layout">
      {/* ---- Top Header ---- */}
      <Header className="admin-header">
        <div className="admin-logo">
          <img src="https://admin-demo.axmed.com/assets/common/logo.svg" alt="Axmed" style={{ height: 32 }} />
        </div>
        <div className="admin-user">
          <UserOutlined style={{ fontSize: 20 }} />
          <span>Admin</span>
        </div>
      </Header>

      {/* ---- Body: Sidebar + Content ---- */}
      <Layout>
        {/* Sidebar */}
        <Sider
          className="admin-sider"
          width={240}
          collapsedWidth={80}
          collapsible
          collapsed={collapsed}
          onCollapse={handleCollapse}
          trigger={null}
          theme="light"
        >
          <Menu
            mode="inline"
            selectedKeys={getSelectedKeys(location.pathname)}
            openKeys={collapsed ? [] : openKeys}
            onOpenChange={handleOpenChange}
            onClick={handleMenuClick}
            items={menuItems}
            style={{ paddingTop: 8 }}
          />

          {/* Collapse toggle */}
          <div
            className="sider-collapse-btn"
            onClick={() => handleCollapse(!collapsed)}
          >
            {collapsed ? (
              <MenuUnfoldOutlined style={{ fontSize: 16 }} />
            ) : (
              <MenuFoldOutlined style={{ fontSize: 16 }} />
            )}
          </div>
        </Sider>

        {/* Main Content */}
        <Content className="admin-content">
          <Routes>
            <Route path="/" element={<Placeholder title="Dashboard" />} />
            <Route path="/cycles" element={<Placeholder title="Cycle Information" />} />
            <Route path="/buyer-evaluation" element={<BuyerEvaluation />} />
            <Route path="/finance/purchase-orders" element={<FinancePurchaseOrders />} />
            <Route path="/finance/purchase-orders/:id" element={<POReview />} />
            <Route path="/supplier/my-bids" element={<SupplierMyBids />} />
            <Route path="/supplier/fulfillment" element={<SupplierFulfillment />} />

            {/* Placeholder routes for menu items that don't have pages yet */}
            <Route path="/buyers/orders" element={<Placeholder title="Orders" />} />
            <Route path="/buyers/order-items" element={<Placeholder title="Order Items" />} />
            <Route path="/buyers/organizations" element={<Placeholder title="Organizations" />} />
            <Route path="/buyers/users" element={<Placeholder title="Users" />} />
            <Route path="/suppliers/organizations" element={<Placeholder title="Organizations" />} />
            <Route path="/suppliers/users" element={<Placeholder title="Users" />} />
            <Route path="/suppliers/quotations" element={<Placeholder title="Quotations" />} />
            <Route path="/catalogue/skus" element={<Placeholder title="SKUs" />} />
            <Route path="/catalogue/sku-categories" element={<Placeholder title="SKU Categories" />} />
            <Route path="/catalogue/inns" element={<Placeholder title="INNs" />} />
            <Route path="/catalogue/therapy-areas" element={<Placeholder title="Therapy Areas" />} />

            {/* Catch-all */}
            <Route path="*" element={<Placeholder title="Page Not Found" />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
