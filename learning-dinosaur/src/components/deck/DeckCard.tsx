import React from 'react';
import {
  Button,
  Card,
  Popconfirm,
  Progress,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { history } from 'umi';
import { deleteDeck } from '../../services';
import { Deck } from '../../services/typing';

const { Text, Paragraph, Title } = Typography;

interface DeckCardProps {
  deck: Deck;
  onEdit: (deck: Deck) => void;
  onReload: () => void;
}

const DeckCard: React.FC<DeckCardProps> = ({ deck, onEdit, onReload }) => {
  const percent =
    (deck?.totalCards || 0) > 0
      ? Math.round(((deck?.masteredCards || 0) / deck.totalCards) * 100)
      : 0;

  const handleDelete = async () => {
    try {
      await deleteDeck(deck.id);
      message.success('Đã xóa bộ thẻ');
      onReload();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Xóa bộ thẻ thất bại');
    }
  };

  return (
    <Card
      className="deck-card"
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      bodyStyle={{ padding: '20px 20px 16px 20px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}
      actions={[
        <Button
          type="text"
          icon={<PlayCircleOutlined style={{ fontSize: '15px' }} />}
          onClick={() => history.push(`/decks/${deck?.id}/study?autoStart=true`)}
        >
          Học
        </Button>,
        <Button
          type="text"
          icon={<EditOutlined style={{ fontSize: '15px' }} />}
          onClick={() => onEdit(deck)}
        >
          Sửa
        </Button>,
        <Popconfirm
          title={
            <div>
              <div style={{ fontWeight: 600 }}>Xóa bộ thẻ này?</div>
              <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
                Tất cả các thẻ trong bộ này cũng sẽ bị xóa vĩnh viễn.
              </div>
            </div>
          }
          okText="Xóa"
          cancelText="Hủy"
          onConfirm={handleDelete}
        >
          <Button danger type="text" icon={<DeleteOutlined style={{ fontSize: '15px' }} />} className="ant-btn-dangerous">
            Xóa
          </Button>
        </Popconfirm>,
      ]}
      onClick={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest('button') || target.closest('.ant-popover') || target.closest('.ant-popconfirm')) return;
        if (deck?.id) history.push(`/decks/${deck.id}`);
      }}
    >
      <Title level={5} style={{ color: '#2e3856', fontWeight: 800, margin: 0, fontSize: '17px', lineHeight: '1.4' }}>
        {deck?.name}
      </Title>

      <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ fontSize: '13px', color: '#586380', margin: 0, minHeight: '38px', lineHeight: '1.5' }}>
        {deck?.description || 'Chưa có mô tả'}
      </Paragraph>

      <Space wrap style={{ margin: '4px 0 0 0' }}>
        {deck?.tags?.map((tag) => (
          <Tag 
            key={tag}
            style={{ 
              background: '#f4fbf7', 
              border: '1px solid #e6f4ea', 
              color: '#2f855a', 
              borderRadius: '6px', 
              padding: '2px 8px',
              fontWeight: 600,
              fontSize: '11px',
              margin: 0
            }}
          >
            {tag}
          </Tag>
        ))}
      </Space>

      <div className="deck-card-meta" style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <Text style={{ color: '#2e3856', fontSize: '13px', fontWeight: 600 }}>
          {deck?.masteredCards || 0}/{deck?.totalCards || 0} thẻ đã thuộc
        </Text>
        <Progress 
          percent={percent} 
          size="small" 
          strokeColor="#2f855a" 
          trailColor="#edf0ee"
          style={{ margin: 0 }}
        />
      </div>
    </Card>
  );
};

export default DeckCard;
