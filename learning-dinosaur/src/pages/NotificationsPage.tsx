import React, { useState, useEffect } from 'react';
import { Button, Card, List, Typography, Space, Tag, Empty, message, Popconfirm, Avatar, Badge, Tooltip } from 'antd';
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  FireOutlined,
  TrophyOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  ClearOutlined
} from '@ant-design/icons';
import { history } from 'umi';

const { Title, Text, Paragraph } = Typography;

interface NotificationItem {
  id: string;
  title: string;
  content: string;
  read: boolean;
  type: 'study' | 'achievement' | 'system' | 'success';
  createdAt: string;
  icon: string;
  iconColor: string;
  iconBg: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Giữ vững phong độ học tập',
    content: 'Hôm nay bạn chưa học thẻ nào cả! Hãy hoàn thành ít nhất một lượt học để duy trì streak 3 ngày của mình nhé.',
    read: false,
    type: 'study',
    createdAt: '20 phút trước',
    icon: '🔥',
    iconColor: '#e056fd',
    iconBg: '#fbeeff',
  },
  {
    id: '2',
    title: 'Huy hiệu mới mở khóa!',
    content: 'Chúc mừng bạn đã đạt huy hiệu "Trứng Khủng Long" vì đã đăng nhập và bắt đầu lộ trình học tập thành công.',
    read: false,
    type: 'achievement',
    createdAt: '4 giờ trước',
    icon: '🏆',
    iconColor: '#ffb703',
    iconBg: '#fff9e6',
  },
  {
    id: '3',
    title: 'Hệ thống cập nhật phiên bản 2.0',
    content: 'Các mini-game Blast và Cờ thế giới đã được nâng cấp giao diện mượt mà và trực quan hơn. Khám phá ngay tại trang chủ!',
    read: true,
    type: 'system',
    createdAt: 'Hôm qua',
    icon: '🚀',
    iconColor: '#0077b6',
    iconBg: '#e6f5ff',
  },
  {
    id: '4',
    title: 'Đã thuộc toàn bộ thẻ học',
    content: 'Tuyệt vời! Bạn đã trả lời chính xác tất cả các từ trong bộ thẻ "Từ vựng tiếng Anh giao tiếp"!',
    read: true,
    type: 'success',
    createdAt: '3 ngày trước',
    icon: '🎉',
    iconColor: '#2f855a',
    iconBg: '#eef9f3',
  },
];

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'study' | 'achievement' | 'system' | 'success'>('all');
  const [pageLoading, setPageLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('dino_notifications');
      if (stored) {
        setNotifications(JSON.parse(stored));
      } else {
        setNotifications(INITIAL_NOTIFICATIONS);
        localStorage.setItem('dino_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
      }
    } catch {
      setNotifications(INITIAL_NOTIFICATIONS);
    }
  }, []);

  const saveToStorage = (newNotifs: NotificationItem[]) => {
    setNotifications(newNotifs);
    localStorage.setItem('dino_notifications', JSON.stringify(newNotifs));
  };

  const handleMarkAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    saveToStorage(updated);
    message.success('Đã đánh dấu là đã đọc');
  };

  const handleMarkAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveToStorage(updated);
    message.success('Đã đánh dấu đã đọc tất cả thông báo');
  };

  const handleDelete = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    saveToStorage(updated);
    message.success('Đã xóa thông báo');
  };

  const handleClearAll = () => {
    saveToStorage([]);
    message.success('Đã xóa tất cả thông báo');
  };

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderIcon = (item: NotificationItem) => {
    const style = {
      backgroundColor: item.iconBg,
      fontSize: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '12px',
      width: '44px',
      height: '44px',
      flexShrink: 0
    };

    return <div style={style}>{item.icon}</div>;
  };

  if (pageLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', width: '100%', background: '#ffffff' }}>
        <div className="dino-animation" style={{ fontSize: '64px', marginBottom: '16px' }}>🦕</div>
        <div className="splash-spinner-container">
          <div className="splash-spinner"></div>
        </div>
        <div className="splash-text">Đang tải hộp thư thông báo...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined style={{ fontSize: '18px', color: '#586380' }} />} 
          onClick={() => history.push('/')}
          style={{ borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Title level={2} style={{ color: '#2e3856', fontWeight: 800, margin: 0 }}>
              Thông báo
            </Title>
            {unreadCount > 0 && (
              <Badge count={unreadCount} style={{ backgroundColor: '#ef4444', fontWeight: 700 }} />
            )}
          </div>
          <Text type="secondary" style={{ fontSize: '14px', color: '#586380' }}>
            Quản lý các cập nhật và nhắc nhở học tập của bạn.
          </Text>
        </div>
      </div>

      <Card
        style={{
          borderRadius: '20px',
          border: '1px solid #edf0ee',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          background: '#ffffff',
          overflow: 'hidden'
        }}
        bodyStyle={{ padding: '24px' }}
      >
        {/* Toolbar & Filters */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '16px', 
          borderBottom: '1px solid #f0f2f0', 
          paddingBottom: '20px',
          marginBottom: '20px'
        }}>
          {/* Custom Tag Filters */}
          <Space size="small" wrap>
            <Button
              type={filter === 'all' ? 'primary' : 'text'}
              style={{
                borderRadius: '8px',
                fontWeight: 600,
                background: filter === 'all' ? '#4257b2' : 'transparent',
                color: filter === 'all' ? '#ffffff' : '#586380',
              }}
              onClick={() => setFilter('all')}
            >
              Tất cả
            </Button>
            <Button
              type={filter === 'study' ? 'primary' : 'text'}
              style={{
                borderRadius: '8px',
                fontWeight: 600,
                background: filter === 'study' ? '#e056fd' : 'transparent',
                color: filter === 'study' ? '#ffffff' : '#586380',
              }}
              onClick={() => setFilter('study')}
            >
              Học tập
            </Button>
            <Button
              type={filter === 'achievement' ? 'primary' : 'text'}
              style={{
                borderRadius: '8px',
                fontWeight: 600,
                background: filter === 'achievement' ? '#ffb703' : 'transparent',
                color: filter === 'achievement' ? '#ffffff' : '#586380',
              }}
              onClick={() => setFilter('achievement')}
            >
              Thành tích
            </Button>
            <Button
              type={filter === 'system' ? 'primary' : 'text'}
              style={{
                borderRadius: '8px',
                fontWeight: 600,
                background: filter === 'system' ? '#0077b6' : 'transparent',
                color: filter === 'system' ? '#ffffff' : '#586380',
              }}
              onClick={() => setFilter('system')}
            >
              Hệ thống
            </Button>
            <Button
              type={filter === 'success' ? 'primary' : 'text'}
              style={{
                borderRadius: '8px',
                fontWeight: 600,
                background: filter === 'success' ? '#2f855a' : 'transparent',
                color: filter === 'success' ? '#ffffff' : '#586380',
              }}
              onClick={() => setFilter('success')}
            >
              Hoàn thành
            </Button>
          </Space>

          {/* Quick actions */}
          {notifications.length > 0 && (
            <Space>
              {unreadCount > 0 && (
                <Button 
                  type="text" 
                  icon={<CheckOutlined />} 
                  onClick={handleMarkAllAsRead}
                  style={{ color: '#4257b2', fontWeight: 600 }}
                >
                  Đọc tất cả
                </Button>
              )}
              <Popconfirm
                title={
                  <div>
                    <div style={{ fontWeight: 600 }}>Xóa tất cả thông báo?</div>
                    <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
                      Hành động này sẽ xóa vĩnh viễn toàn bộ danh sách thông báo hiện tại.
                    </div>
                  </div>
                }
                onConfirm={handleClearAll}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button 
                  type="text" 
                  danger 
                  icon={<ClearOutlined />} 
                  style={{ fontWeight: 600 }}
                >
                  Xóa tất cả
                </Button>
              </Popconfirm>
            </Space>
          )}
        </div>

        {/* List of Notifications */}
        {filteredNotifs.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span style={{ color: '#939bb4', fontSize: '14px' }}>
                Không có thông báo nào trong mục này.
              </span>
            }
            style={{ padding: '60px 0' }}
          />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={filteredNotifs}
            renderItem={item => (
              <List.Item
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  marginBottom: '12px',
                  border: '1px solid #edf0ee',
                  background: item.read ? '#ffffff' : '#f4f7fd',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                className="notification-item-card"
                actions={[
                  <Space key="actions">
                    {!item.read && (
                      <Tooltip title="Đánh dấu đã đọc">
                        <Button
                          type="text"
                          icon={<CheckOutlined />}
                          onClick={() => handleMarkAsRead(item.id)}
                          style={{ color: '#2f855a', borderRadius: '6px' }}
                        />
                      </Tooltip>
                    )}
                    <Tooltip title="Xóa thông báo">
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(item.id)}
                        style={{ borderRadius: '6px' }}
                      />
                    </Tooltip>
                  </Space>
                ]}
              >
                <div style={{ display: 'flex', gap: '16px', width: '100%', alignItems: 'flex-start' }}>
                  {/* Status Indicator Dot */}
                  {!item.read && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '8px',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#2563eb'
                    }} />
                  )}
                  {renderIcon(item)}
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <Text strong style={{ color: '#2e3856', fontSize: '15px' }}>
                        {item.title}
                      </Text>
                      {!item.read && (
                        <Tag color="blue" style={{ borderRadius: '4px', fontSize: '10px', fontWeight: 700, margin: 0, padding: '0 4px' }}>
                          MỚI
                        </Tag>
                      )}
                    </div>
                    <Paragraph style={{ color: '#586380', fontSize: '13px', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                      {item.content}
                    </Paragraph>
                    <Text type="secondary" style={{ fontSize: '11px', color: '#939bb4', marginTop: '6px' }}>
                      {item.createdAt}
                    </Text>
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default NotificationsPage;
