import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Typography, Spin, Space } from 'antd';
import {
  CheckCircleOutlined,
  FireOutlined,
  ReadOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { getStatsOverview, getWeeklyStats } from '../services';
import { StatsOverview, WeeklyStat } from '../services/typing';
import Chart from '../components/Chart';
import TableStaticData from '../components/TableStaticData';

const { Title, Text } = Typography;

const StatisticsPage: React.FC = () => {
  const [overview, setOverview] = useState<StatsOverview | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyStat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const [overviewData, chartData] = await Promise.all([
          getStatsOverview(),
          getWeeklyStats(),
        ]);
        setOverview(overviewData);
        setWeeklyData(chartData);
      } catch (error) {
        // Ignored
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', width: '100%', background: '#ffffff' }}>
        <div className="dino-animation" style={{ fontSize: '64px', marginBottom: '16px' }}>🦕</div>
        <div className="splash-spinner-container">
          <div className="splash-spinner"></div>
        </div>
        <div className="splash-text">Đang phân tích số liệu thống kê...</div>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <Title level={2}>Thống kê học tập</Title>
          <Text type="secondary">
            Theo dõi tiến độ học flashcard và quá trình tiến hóa của chú khủng long.
          </Text>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: 16 }}>
            <Statistic
              title="Lượt học hôm nay"
              value={overview?.cardsStudiedToday || 0}
              prefix={<ReadOutlined style={{ color: '#1890ff' }} />}
              suffix="lượt"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: 16 }}>
            <Statistic
              title="Tổng số thẻ đã thuộc"
              value={overview?.totalMasteredCards || 0}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              suffix="thẻ"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: 16 }}>
            <Statistic
              title="Streak hiện tại"
              value={overview?.currentStreak || 0}
              prefix={<FireOutlined style={{ color: '#ff4d4f' }} />}
              suffix="ngày"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: 16 }}>
            <Statistic
              title="Tổng XP tích lũy"
              value={overview?.totalXP || 0}
              prefix={<ThunderboltOutlined style={{ color: '#faad14' }} />}
              suffix="XP"
            />
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: 24 }}>
        <Title level={4}>Hoạt động ôn tập 7 ngày gần nhất</Title>
        <Chart data={weeklyData} />
      </div>

      <div style={{ marginTop: 24 }}>
        <TableStaticData />
      </div>

      <Card style={{ marginTop: 24, borderRadius: 16 }}>
        <Title level={4}>Tổng kết</Title>
        <Text>
          Bạn đã thực hiện tổng cộng <b>{overview?.totalStudyLogs || 0}</b> lượt học thẻ kể từ khi bắt đầu. Hãy duy trì thói quen ôn tập hàng ngày nhé!
        </Text>
      </Card>
    </>
  );
};

export default StatisticsPage;
