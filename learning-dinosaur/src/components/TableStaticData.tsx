import React from 'react';
import { Table, Tag, Typography } from 'antd';

const { Text } = Typography;

interface MilestoneItem {
  key: string;
  level: string;
  xpRequired: string;
  title: string;
  badgeCode: string;
  status: string;
}

const TableStaticData: React.FC = () => {
  const columns = [
    {
      title: 'Cấp độ',
      dataIndex: 'level',
      key: 'level',
      render: (text: string) => <strong style={{ color: '#166534' }}>{text}</strong>,
    },
    {
      title: 'Tên danh hiệu',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <Text>{text}</Text>,
    },
    {
      title: 'Mốc XP',
      dataIndex: 'xpRequired',
      key: 'xpRequired',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Mã Huy hiệu nhận được',
      dataIndex: 'badgeCode',
      key: 'badgeCode',
      render: (code: string) => <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>{code}</code>,
    },
  ];

  const data: MilestoneItem[] = [
    {
      key: '1',
      level: 'Cấp 1',
      xpRequired: '0 XP',
      title: 'Trứng Khủng Long (Dino Egg)',
      badgeCode: 'FIRST_STEP',
      status: 'Mặc định',
    },
    {
      key: '2',
      level: 'Cấp 2',
      xpRequired: '500 XP',
      title: 'Khủng Long Sơ Sinh (Baby Dino)',
      badgeCode: 'STREAK_7',
      status: 'Học tập đều đặn',
    },
    {
      key: '3',
      level: 'Cấp 3',
      xpRequired: '1500 XP',
      title: 'Khủng Long Tập Đi (Toddler Dino)',
      badgeCode: 'STUDY_100',
      status: 'Chăm chỉ',
    },
    {
      key: '4',
      level: 'Cấp 4',
      xpRequired: '3000 XP',
      title: 'Khủng Long Bất Tử (Dinosaur Legend)',
      badgeCode: 'DINOSAUR_LEGEND',
      status: 'Huyền thoại',
    },
  ];

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e8ecea', borderRadius: 16, padding: '16px', overflow: 'hidden' }}>
      <div style={{ marginBottom: 12 }}>
        <Text strong style={{ fontSize: 16, color: '#374151' }}>Bảng Cột Mốc Cấp Độ & Phần Thưởng</Text>
      </div>
      <Table 
        columns={columns} 
        dataSource={data} 
        pagination={false} 
        size="middle"
        style={{ borderRadius: 12, overflow: 'hidden' }}
      />
    </div>
  );
};

export default TableStaticData;
