import React from 'react';
import { Layout, Menu, Button, message } from 'antd';
import {
  HomeOutlined,
  FolderOutlined,
  TeamOutlined,
  BellOutlined,
  PlusOutlined,
  FileTextOutlined,
  BulbOutlined,
  LogoutOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { Link, history, useLocation, useModel } from 'umi';
import FolderModal, { FolderData } from '../folder/FolderModal';

const { Sider } = Layout;

const AppSidebar: React.FC = () => {
  const location = useLocation();
  const { logoutUser } = useModel('useAuthModel');
  const { t } = useModel('useLocaleModel');
  const { collapsed, setCollapsed } = useModel('useLayoutModel');

  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 992;
    }
    return false;
  });

  const [folders, setFolders] = React.useState<FolderData[]>([]);
  const [showFolderModal, setShowFolderModal] = React.useState<boolean>(false);

  const loadFolders = () => {
    try {
      const stored = localStorage.getItem('dino_folders');
      if (stored) {
        setFolders(JSON.parse(stored));
      } else {
        setFolders([]);
      }
    } catch (e) {
      setFolders([]);
    }
  };

  React.useEffect(() => {
    loadFolders();
  }, []);

  const handleLogout = () => {
    logoutUser();
    history.push('/login');
  };

  // Close sidebar on navigate (mobile only)
  React.useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [location.pathname, isMobile]);

  const getSelectedKey = () => {
    const params = new URLSearchParams(location.search);
    const folderIdParam = params.get('folderId');
    const tabParam = params.get('tab');
    if (folderIdParam) {
      return `/?folderId=${folderIdParam}`;
    }
    if (tabParam === 'library') {
      return 'library';
    }
    return location.pathname;
  };

  const getMenuItems = () => {
    const items: any[] = [
      {
        key: '/',
        icon: <HomeOutlined />,
        label: <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Trang chủ</Link>,
      },
      {
        key: 'library',
        icon: <FolderOutlined />,
        label: <Link to="/?tab=library" style={{ color: 'inherit', textDecoration: 'none' }}>Thư viện của bạn</Link>,
      },
      {
        key: '/notifications',
        icon: <BellOutlined />,
        label: <Link to="/notifications" style={{ color: 'inherit', textDecoration: 'none' }}>Thông báo</Link>,
      },
      {
        type: 'divider',
        style: { margin: '8px 0' }
      },
      {
        type: 'group',
        label: !collapsed ? 'Your folders' : null,
        children: [
          {
            key: 'create-folder-trigger',
            icon: <PlusOutlined style={{ color: '#2f855a' }} />,
            label: <span style={{ color: '#2f855a', fontWeight: 600 }} onClick={() => setShowFolderModal(true)}>Thư mục mới</span>,
          },
          ...folders.map(folder => ({
            key: `/?folderId=${folder.id}`,
            icon: <FolderOutlined style={{ color: '#4257b2' }} />,
            label: <Link to={`/?folderId=${folder.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{folder.name}</Link>,
          }))
        ]
      },
      {
        type: 'divider',
        style: { margin: '8px 0' }
      },
      {
        type: 'group',
        label: !collapsed ? 'Start here' : null,
        children: [
          {
            key: '/decks/new',
            icon: <FileTextOutlined />,
            label: <Link to="/decks/new" style={{ color: 'inherit', textDecoration: 'none' }}>Thẻ học từ vựng</Link>,
          },
          {
            key: '/expert-solutions',
            icon: <BulbOutlined />,
            label: <Link to="/expert-solutions" style={{ color: 'inherit', textDecoration: 'none' }}>Giải pháp chuyên gia</Link>,
          }
        ]
      }
    ];

    return items;
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobile && !collapsed && (
        <div
          className="sidebar-mobile-overlay"
          onClick={() => setCollapsed(true)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.45)',
            zIndex: 1000,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}
      <Sider
        width={240}
        breakpoint="lg"
        collapsedWidth={isMobile ? 0 : 80}
        onBreakpoint={(broken) => {
          setIsMobile(broken);
        }}
        trigger={null}
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        className="app-sidebar"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          left: 0,
          zIndex: 1001,
          background: '#ffffff',
          borderRight: '1px solid #edf0ee',
        }}
      >
        <div 
          className="sidebar-header"
          style={{ 
            height: '64px', 
            display: 'flex', 
            alignItems: 'center', 
            padding: collapsed ? '0' : '0 20px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: '16px',
            borderBottom: '1px solid #edf0ee',
          }}
        >
          <Button
            type="text"
            icon={<MenuOutlined style={{ fontSize: '20px', color: '#586380' }} />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              padding: 0,
              borderRadius: '8px',
            }}
          />
          {!collapsed && (
            <div 
              onClick={() => history.push('/')} 
              style={{ 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#4257b2',
                color: '#ffffff',
                fontSize: '18px',
                boxShadow: '0 2px 6px rgba(66, 87, 178, 0.3)',
                transition: 'transform 0.2s ease',
              }}
              className="sidebar-logo-dino"
              title="Learning Dinosaur"
            >
              🦕
            </div>
          )}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: '16px', justifyContent: 'space-between' }}>
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            items={getMenuItems()}
            onClick={({ key }) => {
              if (key === 'create-folder-trigger') {
                setShowFolderModal(true);
              }
            }}
            style={{ borderRight: 0 }}
          />
          
          {/* Đăng xuất section at the bottom of the sidebar */}
          <div style={{ padding: '16px 12px', borderTop: '1px solid #edf0ee', marginTop: 'auto' }}>
            <Button
              type="text"
              danger
              icon={<LogoutOutlined style={{ fontSize: '16px' }} />}
              onClick={handleLogout}
              style={{
                width: '100%',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                height: '40px',
                fontWeight: 600,
                borderRadius: '8px',
                padding: '0 12px',
              }}
            >
              {!collapsed && <span>Đăng xuất</span>}
            </Button>
          </div>
        </div>
      </Sider>

      <FolderModal
        visible={showFolderModal}
        onCancel={() => setShowFolderModal(false)}
        onSuccess={loadFolders}
      />
    </>
  );
};

export default AppSidebar;
