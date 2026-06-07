import React, { useEffect, useState } from 'react';
import { Alert, Card, Col, Row, Statistic, Tag, Typography } from 'antd';
import {
  CheckCircleOutlined,
  FireOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { getStatsOverview } from '../../services';
import { StatsOverview } from '../../services/typing';

const { Text } = Typography;

const StreakBanner: React.FC = () => {
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getStatsOverview();
        setStats(data);
      } catch (e) {
        setStats(null);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return <Card loading={true} style={{ borderRadius: 18 }} />;
  }

  const currentStreak = stats?.currentStreak || 0;
  const cardsStudiedToday = stats?.cardsStudiedToday || 0;
  const totalXP = stats?.totalXP || 0;
  const currentLevel = stats?.currentLevel || '🥚 Trứng Khủng Long';
  const hasStudiedToday = cardsStudiedToday > 0;

  return (
    <Card className="streak-banner">
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} md={8}>
          <Statistic
            title="Streak hiện tại"
            value={currentStreak}
            suffix="ngày"
            prefix={<FireOutlined />}
          />
        </Col>

        <Col xs={24} md={8}>
          <Statistic
            title="Thẻ đã học hôm nay"
            value={cardsStudiedToday}
            suffix="lượt"
            prefix={<CheckCircleOutlined />}
          />
        </Col>

        <Col xs={24} md={8}>
          <Statistic
            title="Tổng XP"
            value={totalXP}
            prefix={<ThunderboltOutlined />}
          />
          <Tag color="green" style={{ marginTop: 8 }}>
            {currentLevel}
          </Tag>
        </Col>
      </Row>

      <div className="streak-message">
        {hasStudiedToday ? (
          <Alert
            type="success"
            showIcon
            message="Tuyệt vời! Hôm nay bạn đã học rồi."
            description={
              <Text>
                Hãy duy trì thói quen học đều đặn để chú khủng long tiếp tục
                tiến hóa.
              </Text>
            }
          />
        ) : (
          <Alert
            type="warning"
            showIcon
            message="Hôm nay bạn chưa học thẻ nào."
            description={
              <Text>Học ít nhất 1 thẻ hôm nay để duy trì streak hiện tại của bạn.</Text>
            }
          />
        )}
      </div>
    </Card>
  );
};

export default StreakBanner;
