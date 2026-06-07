import React, { useState } from 'react';
import { Layout, Space, Typography, Tag, Dropdown, Menu, Avatar, Switch, Button, message } from 'antd';
import { useModel, history } from 'umi';
import { getLevelByXp } from '../../utils/level';
import GlobalSearch from './GlobalSearch';
import {
  TrophyOutlined,
  BarChartOutlined,
  SettingOutlined,
  MoonOutlined,
  LogoutOutlined,
  MenuOutlined,
} from '@ant-design/icons';

const { Header } = Layout;
const { Text } = Typography;

const avatarOptions = [
  { char: '🦕', color: '#7b2cbf' },
  { char: '🦖', color: '#2f855a' },
  { char: '🦎', color: '#0077b6' },
  { char: '🦉', color: '#d90429' },
  { char: '🐧', color: '#ffb703' },
  { char: '🦊', color: '#f77f00' },
  { char: '🦁', color: '#8338ec' },
  { char: '🐯', color: '#3a86c8' },
  { char: '🐸', color: '#38b000' },
  { char: '🐙', color: '#ff006e' },
  { char: '🐝', color: '#fb5607' },
];

const AppHeader: React.FC = () => {
  const { user, logoutUser } = useModel('useAuthModel');
  const level = getLevelByXp(user?.xp || 0);
  const { t } = useModel('useLocaleModel');
  const { collapsed, toggleSidebar } = useModel('useLayoutModel');

  const userAvatarIndex = user?.avatarIndex ?? 0;
  const userAvatarChar = avatarOptions[userAvatarIndex]?.char || (user?.displayName?.[0]?.toUpperCase() || 'D');
  const userAvatarBg = avatarOptions[userAvatarIndex]?.color || '#7b2cbf';

  const getLevelTranslation = (levelName: string) => {
    if (levelName === 'Trứng Khủng Long') return t('level.egg');
    if (levelName === 'Khủng Long Bột') return t('level.baby');
    if (levelName === 'Khủng Long Học Việc') return t('level.apprentice');
    if (levelName === 'T-Rex Mê Học') return t('level.trex');
    if (levelName === 'Khủng Long Thông Thái') return t('level.wise');
    if (levelName === 'Khủng Long Bất Tử') return t('level.immortal');
    return levelName;
  };

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  const toggleDarkMode = (checked: boolean) => {
    setDarkMode(checked);
    if (checked) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    logoutUser();
    history.push('/login');
  };

  const userMenu = (
    <Menu style={{ width: '220px', borderRadius: '12px', padding: '4px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f0f0f0', marginBottom: '4px' }}>
        <Avatar
          size={40}
          src={user?.avatarUrl || undefined}
          style={{
            backgroundColor: user?.avatarUrl ? '#f0f2f5' : userAvatarBg,
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {!user?.avatarUrl && userAvatarChar}
        </Avatar>
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Text strong style={{ color: '#2e3856', fontSize: '14px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {user?.displayName}
          </Text>
          <Text type="secondary" style={{ fontSize: '12px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {user?.email}
          </Text>
        </div>
      </div>

      <Menu.Item key="achievements" icon={<TrophyOutlined style={{ fontSize: '15px' }} />} onClick={() => history.push('/achievements')} style={{ borderRadius: '8px', padding: '8px 12px' }}>
        {t('sidebar.achievements')}
      </Menu.Item>

      <Menu.Item key="statistics" icon={<BarChartOutlined style={{ fontSize: '15px' }} />} onClick={() => history.push('/statistics')} style={{ borderRadius: '8px', padding: '8px 12px' }}>
        {t('sidebar.stats')}
      </Menu.Item>

      <Menu.Item key="settings" icon={<SettingOutlined style={{ fontSize: '15px' }} />} onClick={() => history.push('/settings')} style={{ borderRadius: '8px', padding: '8px 12px' }}>
        {t('settings.title')}
      </Menu.Item>

      <Menu.Item key="darkmode" icon={<MoonOutlined style={{ fontSize: '15px' }} />} style={{ borderRadius: '8px', padding: '8px 12px', cursor: 'default' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }} onClick={(e) => e.stopPropagation()}>
          <span style={{ marginRight: '16px', color: 'rgba(0, 0, 0, 0.85)' }}>{t('header.darkTheme')}</span>
          <Switch size="small" checked={darkMode} onChange={toggleDarkMode} />
        </div>
      </Menu.Item>

      <Menu.Divider style={{ margin: '4px 0' }} />

      <Menu.Item key="logout" icon={<LogoutOutlined style={{ fontSize: '15px' }} />} danger onClick={handleLogout} style={{ borderRadius: '8px', padding: '8px 12px' }}>
        {t('sidebar.logout')}
      </Menu.Item>
    </Menu>
  );

  return (
    <Header className="app-header" style={{ position: 'sticky', top: 0, zIndex: 1000, background: '#ffffff', borderBottom: '1px solid #edf0ee', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: '64px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Button
          type="text"
          icon={<MenuOutlined style={{ fontSize: '20px', color: '#2e3856' }} />}
          onClick={toggleSidebar}
          className="mobile-menu-btn"
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            padding: 0,
            borderRadius: '8px',
          }}
        />
        <div className="header-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => history.push('/')}>
          <span style={{ fontSize: '24px' }}>🦕</span>
          <span className="header-logo-text" style={{ fontWeight: 800, fontSize: '18px', color: '#2e3856', letterSpacing: '-0.02em' }}>
            {t('sidebar.logo')}
          </span>
        </div>
        <div className="header-greeting-desktop" style={{ marginLeft: '16px' }}>
          <Text strong style={{ fontSize: '15px', color: '#586380' }}>
            {t('header.greeting', { name: user?.displayName || t('header.defaultName') })}
          </Text>
        </div>
      </div>

      <Space className="app-header-right" size="small" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <Space className="header-tags-desktop" size="small" style={{ display: 'flex' }}>
          <Tag
            color="orange"
            style={{
              border: '1px solid #ffd591',
              color: '#d4380d',
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '13px',
              margin: 0,
            }}
          >
            🔥 {user?.currentStreak || 0} {t('header.days')}
          </Tag>
          
          <Tag
            color="blue"
            style={{
              border: '1px solid #91d5ff',
              color: '#096dd9',
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '13px',
              margin: 0,
            }}
          >
            ⚡ {user?.xp || 0} XP
          </Tag>
          
          <Tag
            color="purple"
            className="rank-tag"
            style={{
              border: '1px solid #d3adf7',
              color: '#531dab',
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '13px',
              margin: 0,
            }}
          >
            {level.icon} {getLevelTranslation(level.name)}
          </Tag>
        </Space>

        <GlobalSearch />

        <Dropdown overlay={userMenu} trigger={['click']} placement="bottomRight">
          <Avatar
            size={36}
            src={user?.avatarUrl || undefined}
            style={{
              backgroundColor: user?.avatarUrl ? '#f0f2f5' : userAvatarBg,
              color: '#ffffff',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: user?.avatarUrl ? '0 2px 8px rgba(0,0,0,0.1)' : `0 2px 8px ${userAvatarBg}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px'
            }}
          >
            {!user?.avatarUrl && userAvatarChar}
          </Avatar>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default AppHeader;
