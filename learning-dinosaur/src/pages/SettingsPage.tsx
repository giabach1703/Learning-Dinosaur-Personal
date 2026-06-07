import React, { useState, useEffect, useRef } from 'react';
import { Button, Card, Col, Row, Select, Typography, Input, message, Tooltip, Switch, Avatar } from 'antd';
import { useModel, history } from 'umi';
import { MailOutlined, InfoCircleOutlined } from '@ant-design/icons';
import '../global.css';

const { Title, Text, Link } = Typography;

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

const SettingsPage: React.FC = () => {
  const { user, updateUserProfile } = useModel('useAuthModel');
  const { locale, setLocale, t } = useModel('useLocaleModel');
  const [pageLoading, setPageLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const [editUsername, setEditUsername] = useState<boolean>(false);
  const [editEmail, setEditEmail] = useState<boolean>(false);

  const [usernameInput, setUsernameInput] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');

  const [accountType, setAccountType] = useState<string>('student');
  const [theme, setTheme] = useState<string>(() => {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('theme') || 'light';
      }
    } catch (e) {
      // Ignored
    }
    return 'light';
  });

  const [streakBadgeNotif, setStreakBadgeNotif] = useState<boolean>(true);
  const [studyReminderNotif, setStudyReminderNotif] = useState<boolean>(true);
  const [reminderTime, setReminderTime] = useState<string>('8');

  const getHourOptions = () => {
    const options = [];
    for (let h = 0; h < 24; h++) {
      const val = String(h);
      let label = '';
      if (locale === 'vi') {
        if (h === 0) label = '00:00 (12h đêm)';
        else if (h < 12) label = `${String(h).padStart(2, '0')}:00 (${h}h sáng)`;
        else if (h === 12) label = '12:00 (12h trưa)';
        else label = `${String(h).padStart(2, '0')}:00 (${h - 12}h chiều/tối)`;
      } else {
        if (h === 0) label = '12:00 AM (00:00)';
        else if (h < 12) label = `${h}:00 AM (${String(h).padStart(2, '0')}:00)`;
        else if (h === 12) label = '12:00 PM (12:00)';
        else label = `${h - 12}:00 PM (${String(h).padStart(2, '0')}:00)`;
      }
      options.push({ label, value: val });
    }
    return options;
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState<number>(0);

  // Initialize input fields
  useEffect(() => {
    if (user) {
      setUsernameInput(user.displayName);
      setEmailInput(user.email);
      if (user.avatarIndex !== undefined) {
        setSelectedAvatarIndex(user.avatarIndex);
      }
    }
  }, [user]);

  const handleAvatarChange = async (index: number) => {
    setSelectedAvatarIndex(index);
    try {
      await updateUserProfile({ avatarIndex: index, avatarUrl: null });
      message.success(t('settings.avatarSuccess'));
    } catch (error: any) {
      message.error(error.response?.data?.message || t('settings.updateFailed'));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      message.error(locale === 'vi' ? 'Chỉ hỗ trợ tệp ảnh' : 'Only image files are supported');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 128;
        const MAX_HEIGHT = 128;
        let width = img.width;
        let height = img.height;

        let sx = 0;
        let sy = 0;
        let sWidth = width;
        let sHeight = height;

        if (width > height) {
          sx = (width - height) / 2;
          sWidth = height;
        } else if (height > width) {
          sy = (height - width) / 2;
          sHeight = width;
        }

        canvas.width = MAX_WIDTH;
        canvas.height = MAX_HEIGHT;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, MAX_WIDTH, MAX_HEIGHT);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

          try {
            await updateUserProfile({ avatarUrl: dataUrl });
            message.success(t('settings.avatarSuccess'));
          } catch (error: any) {
            message.error(error.response?.data?.message || t('settings.updateFailed'));
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveUsername = async () => {
    if (!usernameInput.trim()) {
      message.error(t('settings.usernameEmpty'));
      return;
    }
    try {
      await updateUserProfile({ displayName: usernameInput });
      message.success(t('settings.usernameSuccess'));
      setEditUsername(false);
    } catch (error: any) {
      message.error(error.response?.data?.message || t('settings.updateFailed'));
    }
  };

  const handleSaveEmail = async () => {
    if (!emailInput.trim()) {
      message.error(t('settings.emailEmpty'));
      return;
    }
    try {
      await updateUserProfile({ email: emailInput });
      message.success(t('settings.emailSuccess'));
      setEditEmail(false);
    } catch (error: any) {
      message.error(error.response?.data?.message || t('settings.updateFailed'));
    }
  };

  const handleThemeChange = (val: string) => {
    setTheme(val);
    if (val === 'dark') {
      document.body.classList.add('dark-theme');
      try {
        localStorage.setItem('theme', 'dark');
      } catch (e) {}
    } else {
      document.body.classList.remove('dark-theme');
      try {
        localStorage.setItem('theme', 'light');
      } catch (e) {}
    }
    message.success(t('settings.themeSuccess'));
  };

  const currentInitials = user?.displayName?.[0]?.toUpperCase() || 'D';
  const currentAvatarBg = avatarOptions[selectedAvatarIndex]?.color || '#7b2cbf';

  if (pageLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', width: '100%', background: '#ffffff' }}>
        <div className="dino-animation" style={{ fontSize: '64px', marginBottom: '16px' }}>🦕</div>
        <div className="splash-spinner-container">
          <div className="splash-spinner"></div>
        </div>
        <div className="splash-text">Đang tải thiết lập tài khoản...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', paddingBottom: '60px' }}>
      <Title level={2} style={{ color: '#2e3856', fontWeight: 800, marginBottom: '24px' }}>
        {t('settings.title')}
      </Title>

      {/* Đăng ký banner (cosmetic) */}
      <div style={{ marginBottom: '32px' }}>
        <Text strong style={{ display: 'block', fontSize: '15px', color: '#2e3856', marginBottom: '8px' }}>
          {t('settings.subscription')}
        </Text>
        <div
          className="settings-upgrade-banner"
          style={{
            background: 'linear-gradient(90deg, #0a0915 0%, #1c103f 100%)',
            borderRadius: '16px',
            padding: '24px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div>
            <Title level={3} style={{ color: '#ffffff', margin: 0, fontWeight: 700, fontSize: '20px' }}>
              {t('settings.upgradeBannerTitle')}
            </Title>
            <Text style={{ color: '#b9c1d9', fontSize: '13px' }}>
              {t('settings.upgradeBannerSub')}
            </Text>
          </div>
          <Button
            type="primary"
            style={{
              background: '#ffc300',
              borderColor: '#ffc300',
              color: '#000000',
              fontWeight: 700,
              height: '46px',
              borderRadius: '23px',
              padding: '0 24px',
              fontSize: '14px',
              boxShadow: '0 4px 10px rgba(255, 195, 0, 0.3)'
            }}
            onClick={() => message.info(t('settings.upgradeDevInfo'))}
          >
            {t('settings.upgradeBtn')}
          </Button>
        </div>
      </div>

      {/* Thông tin cá nhân */}
      <div style={{ marginBottom: '32px' }}>
        <Text strong style={{ display: 'block', fontSize: '15px', color: '#2e3856', marginBottom: '8px' }}>
          {t('settings.personalInfo')}
        </Text>
        
        <Card className="settings-card" style={{ borderRadius: '16px', border: '1px solid #e8ecea' }}>
          {/* Avatar Section */}
          <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '24px', marginBottom: '24px' }}>
            <Text strong style={{ display: 'block', fontSize: '14px', color: '#2e3856', marginBottom: '12px' }}>
              {t('settings.avatar')}
            </Text>
            
            <div className="settings-avatar-container" style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              {/* Primary Avatar */}
              <Avatar
                size={80}
                src={user?.avatarUrl || undefined}
                style={{
                  backgroundColor: user?.avatarUrl ? '#f0f2f5' : currentAvatarBg,
                  color: '#ffffff',
                  fontWeight: 'bold',
                  fontSize: '36px',
                  boxShadow: user?.avatarUrl ? '0 4px 14px rgba(0,0,0,0.1)' : `0 4px 14px ${currentAvatarBg}35`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {!user?.avatarUrl && (avatarOptions[selectedAvatarIndex]?.char || currentInitials)}
              </Avatar>

              {/* Avatar selection list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {avatarOptions.map((item, index) => (
                    <Avatar
                      key={index}
                      size={36}
                      style={{
                        backgroundColor: item.color,
                        color: '#ffffff',
                        cursor: 'pointer',
                        border: (!user?.avatarUrl && selectedAvatarIndex === index) ? '3px solid #000000' : 'none',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onClick={() => handleAvatarChange(index)}
                    >
                      {item.char}
                    </Avatar>
                  ))}
                  <Avatar
                    size={36}
                    style={{
                      backgroundColor: '#f0f2f5',
                      color: '#595959',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      border: user?.avatarUrl ? '3px solid #2f855a' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    +
                  </Avatar>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Username Section */}
          <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Text strong style={{ display: 'block', fontSize: '14px', color: '#2e3856' }}>
                  {t('settings.username')}
                </Text>
                {!editUsername ? (
                  <Text style={{ fontSize: '15px', color: '#586380', display: 'block', marginTop: '4px' }}>
                    {user?.displayName}
                  </Text>
                ) : (
                  <div className="settings-field-row" style={{ marginTop: '8px', display: 'flex', gap: '8px', maxWidth: '320px' }}>
                    <Input
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      size="middle"
                      style={{ borderRadius: '8px' }}
                    />
                    <Button type="primary" onClick={handleSaveUsername}>{t('settings.save')}</Button>
                    <Button onClick={() => { setEditUsername(false); setUsernameInput(user?.displayName || ''); }}>{t('settings.cancel')}</Button>
                  </div>
                )}
              </div>
              {!editUsername && (
                <Link onClick={() => setEditUsername(true)} style={{ fontWeight: 700, color: '#4257b2' }}>
                  {t('settings.edit')}
                </Link>
              )}
            </div>
          </div>

          {/* Email Section */}
          <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Text strong style={{ display: 'block', fontSize: '14px', color: '#2e3856' }}>
                  {t('settings.email')}
                </Text>
                {!editEmail ? (
                  <Text style={{ fontSize: '15px', color: '#586380', display: 'block', marginTop: '4px' }}>
                    {user?.email}
                  </Text>
                ) : (
                  <div className="settings-field-row" style={{ marginTop: '8px', display: 'flex', gap: '8px', maxWidth: '320px' }}>
                    <Input
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      size="middle"
                      style={{ borderRadius: '8px' }}
                    />
                    <Button type="primary" onClick={handleSaveEmail}>{t('settings.save')}</Button>
                    <Button onClick={() => { setEditEmail(false); setEmailInput(user?.email || ''); }}>{t('settings.cancel')}</Button>
                  </div>
                )}
              </div>
              {!editEmail && (
                <Link onClick={() => setEditEmail(true)} style={{ fontWeight: 700, color: '#4257b2' }}>
                  {t('settings.edit')}
                </Link>
              )}
            </div>
          </div>

          {/* Account Type Section */}
          <div>
            <div className="settings-field-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <Text strong style={{ display: 'block', fontSize: '14px', color: '#2e3856' }}>
                  {t('settings.accountType')}
                </Text>
              </div>
              <Select
                value={accountType}
                onChange={(val) => { setAccountType(val); message.success(t('settings.accountTypeSuccess')); }}
                style={{ width: '130px' }}
                options={[
                  { label: t('settings.student'), value: 'student' },
                  { label: t('settings.teacher'), value: 'teacher' }
                ]}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Về bề ngoài */}
      <div style={{ marginBottom: '32px' }}>
        <Text strong style={{ display: 'block', fontSize: '15px', color: '#2e3856', marginBottom: '8px' }}>
          {t('settings.appearance')}
        </Text>

        <Card className="settings-card" style={{ borderRadius: '16px', border: '1px solid #e8ecea' }}>
          {/* Theme */}
          <div className="settings-field-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid #f0f0f0', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <Text strong style={{ fontSize: '14px', color: '#2e3856' }}>
              {t('settings.theme')}
            </Text>
            <Select
              value={theme}
              onChange={handleThemeChange}
              style={{ width: '130px' }}
              options={[
                { label: t('settings.light'), value: 'light' },
                { label: t('settings.dark'), value: 'dark' }
              ]}
            />
          </div>

          {/* Language */}
          <div className="settings-field-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <Text strong style={{ fontSize: '14px', color: '#2e3856' }}>
              {t('settings.language')}
            </Text>
            <Select
              value={locale}
              onChange={(val) => { setLocale(val); message.success(t('settings.langSuccess')); }}
              style={{ width: '150px' }}
              options={[
                { label: t('settings.englishUs'), value: 'en' },
                { label: t('settings.vietnamese'), value: 'vi' }
              ]}
            />
          </div>
        </Card>
      </div>

      {/* Thông báo */}
      <div>
        <Text strong style={{ display: 'block', fontSize: '15px', color: '#2e3856', marginBottom: '8px' }}>
          {t('settings.notifications')}
        </Text>

        <Card className="settings-card" style={{ borderRadius: '16px', border: '1px solid #e8ecea' }}>
          <div style={{ marginBottom: '20px' }}>
            <Text strong style={{ display: 'block', fontSize: '15px', color: '#2e3856', marginBottom: '16px' }}>
              {t('settings.notifStudyUpdate')}
            </Text>

            {/* Streak and badges */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #f5f5f5', marginBottom: '16px' }}>
              <div>
                <Text style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#2e3856' }}>
                  {t('settings.streakBadges')}
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {t('settings.streakBadgesSub')}
                </Text>
              </div>
              <Button
                type={streakBadgeNotif ? 'primary' : 'default'}
                shape="circle"
                icon={<MailOutlined />}
                onClick={() => { setStreakBadgeNotif(!streakBadgeNotif); message.success(streakBadgeNotif ? t('settings.streakNotifOff') : t('settings.streakNotifOn')); }}
                style={{
                  width: '42px',
                  height: '42px',
                  backgroundColor: streakBadgeNotif ? '#4257b2' : undefined,
                  color: streakBadgeNotif ? '#ffffff' : undefined,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: streakBadgeNotif ? 'none' : undefined
                }}
              />
            </div>

            {/* Study reminders */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #f5f5f5', marginBottom: '16px' }}>
              <div>
                <Text style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#2e3856' }}>
                  {t('settings.studyReminders')}
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {t('settings.studyRemindersSub')}
                </Text>
              </div>
              <Button
                type={studyReminderNotif ? 'primary' : 'default'}
                shape="circle"
                icon={<MailOutlined />}
                onClick={() => { setStudyReminderNotif(!studyReminderNotif); message.success(studyReminderNotif ? t('settings.remindersOff') : t('settings.remindersOn')); }}
                style={{
                  width: '42px',
                  height: '42px',
                  backgroundColor: studyReminderNotif ? '#4257b2' : undefined,
                  color: studyReminderNotif ? '#ffffff' : undefined,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: studyReminderNotif ? 'none' : undefined
                }}
              />
            </div>

            {/* Reminder time */}
            <div className="settings-field-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <Text style={{ fontSize: '14px', fontWeight: 500, color: '#2e3856' }}>
                {t('settings.reminderTimeTitle')}
              </Text>
              <Select
                value={reminderTime}
                onChange={(val) => { setReminderTime(val); message.success(t('settings.reminderTimeSuccess')); }}
                style={{ width: '180px' }}
                options={getHourOptions()}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
