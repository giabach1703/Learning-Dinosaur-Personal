import React, { useEffect, useState } from 'react';
import { Card, Col, Empty, Row, Tag, Typography, Spin, Divider } from 'antd';
import { useModel } from 'umi';
import LevelBadge from '../components/gamification/LevelBadge';
import { getBadges } from '../services';
import { Badge } from '../services/typing';

const { Title, Text } = Typography;

const AchievementsPage: React.FC = () => {
  const { user } = useModel('useAuthModel');
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadBadges() {
      try {
        setLoading(true);
        const data = await getBadges();
        setBadges(Array.isArray(data) ? data : []);
      } catch {
        setBadges([]);
      } finally {
        setLoading(false);
      }
    }

    loadBadges();
  }, []);

  const { unlockedBadges, lockedBadges } = React.useMemo(() => {
    const unlocked = badges.filter((b) => b.unlocked);
    const locked = badges.filter((b) => !b.unlocked);
    return { unlockedBadges: unlocked, lockedBadges: locked };
  }, [badges]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', width: '100%', background: '#ffffff' }}>
        <div className="dino-animation" style={{ fontSize: '64px', marginBottom: '16px' }}>🦕</div>
        <div className="splash-spinner-container">
          <div className="splash-spinner"></div>
        </div>
        <div className="splash-text">Đang tải danh sách thành tích...</div>
      </div>
    );
  }

  const renderBadgeGrid = (badgeList: Badge[], isLocked = false) => {
    if (badgeList.length === 0) {
      return (
        <div style={{ padding: '24px 0', textAlign: 'center', background: '#f6f7fb', borderRadius: '12px' }}>
          <Text type="secondary">{isLocked ? 'Không có huy hiệu chưa khóa nào' : 'Chưa mở khóa huy hiệu nào'}</Text>
        </div>
      );
    }

    return (
      <Row gutter={[16, 16]}>
        {badgeList.map((badge) => (
          <Col xs={24} sm={12} md={8} lg={6} key={badge.code}>
            <Card
              className="badge-card"
              style={{
                borderRadius: 18,
                border: '1px solid #e8ecea',
                transition: 'all 0.3s ease',
                opacity: isLocked ? 0.55 : 1,
                filter: isLocked ? 'grayscale(70%)' : 'none',
                boxShadow: isLocked ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.03)',
                background: isLocked ? '#fcfcfc' : '#ffffff',
              }}
            >
              <Title level={4} style={{ marginTop: 0, color: '#2e3856', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '22px' }}>{isLocked ? '🔒' : '🏆'}</span>
                <span>{badge.name}</span>
              </Title>

              <Text type="secondary" style={{ display: 'block', minHeight: '40px', fontSize: '13px' }}>
                {badge.description}
              </Text>

              <div style={{ marginTop: 12 }}>
                <Tag color={isLocked ? 'default' : 'green'} style={{ borderRadius: '6px', fontWeight: 600 }}>
                  {isLocked ? 'Chưa đạt' : 'Đã đạt'}
                </Tag>
              </div>

              {!isLocked && badge.unlockedAt ? (
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Mở khóa: {new Date(badge.unlockedAt).toLocaleDateString('vi-VN')}
                  </Text>
                </div>
              ) : null}
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <>
      <div className="page-header">
        <div>
          <Title level={2}>Thành tựu</Title>
          <Text type="secondary">
            Theo dõi cấp độ, XP và các huy hiệu học tập của bạn.
          </Text>
        </div>

        <LevelBadge xp={user?.xp || 0} />
      </div>

      {badges.length === 0 ? (
        <Empty description="Chưa có dữ liệu huy hiệu" />
      ) : (
        <div style={{ marginTop: '24px' }}>
          {/* Unlocked Badges */}
          <div style={{ marginBottom: '32px' }}>
            <Title level={3} style={{ color: '#2e3856', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span>🏆</span> Huy hiệu đã đạt ({unlockedBadges.length})
            </Title>
            {renderBadgeGrid(unlockedBadges, false)}
          </div>

          <Divider style={{ margin: '32px 0' }} />

          {/* Locked Badges */}
          <div>
            <Title level={3} style={{ color: '#939bb4', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span>🔒</span> Huy hiệu chưa đạt ({lockedBadges.length})
            </Title>
            {renderBadgeGrid(lockedBadges, true)}
          </div>
        </div>
      )}
    </>
  );
};

export default AchievementsPage;
