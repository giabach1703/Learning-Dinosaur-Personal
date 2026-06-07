import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useParams, history, Link } from 'umi';
import {
  Button,
  Card,
  Empty,
  Form,
  Modal as AntdModal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
  Input,
  message,
  Popover,
  Switch,
  Tooltip,
} from 'antd';
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  StarFilled,
  StarOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  createCardInDeck,
  getDeckById,
  getDeckCards,
  deleteCard,
  toggleReviewFlag,
  updateCard,
} from '../services';
import { Card as CardType, Deck } from '../services/typing';
import TinyEditor from '../components/TinyEditor';

const { Title, Text } = Typography;

const DeckDetailPage: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const [form] = Form.useForm();

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<CardType[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [editingCard, setEditingCard] = useState<CardType | null>(null);
  const [keyword, setKeyword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Study settings state
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [reviewOnly, setReviewOnly] = useState<boolean>(false);

  // Load study settings on mount
  useEffect(() => {
    if (deckId) {
      const saved = localStorage.getItem(`study_settings_${deckId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setShuffle(!!parsed.shuffle);
          setReviewOnly(!!parsed.reviewOnly);
        } catch (e) {
          // Ignored
        }
      } else {
        setShuffle(false);
        setReviewOnly(false);
      }
    }
  }, [deckId]);

  const saveSettings = (newShuffle: boolean, newReviewOnly: boolean) => {
    setShuffle(newShuffle);
    setReviewOnly(newReviewOnly);
    localStorage.setItem(
      `study_settings_${deckId}`,
      JSON.stringify({ shuffle: newShuffle, reviewOnly: newReviewOnly })
    );
  };

  const reloadPage = useCallback(async () => {
    if (!deckId) return;
    try {
      setLoading(true);
      const [deckData, cardData] = await Promise.all([
        getDeckById(deckId),
        getDeckCards(deckId)
      ]);
      setDeck(deckData);
      setCards(Array.isArray(cardData) ? cardData : []);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không tải được dữ liệu bộ thẻ');
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    reloadPage();
  }, [reloadPage]);

  const filteredCards = useMemo(() => {
    const safeCards = Array.isArray(cards) ? cards : [];
    return safeCards.filter((card) => {
      const searchText = keyword.toLowerCase();
      const frontText = card.front.replace(/<[^>]*>/g, '').toLowerCase();
      const backText = card.back.replace(/<[^>]*>/g, '').toLowerCase();
      return (
        frontText.includes(searchText) ||
        backText.includes(searchText) ||
        card.status.toLowerCase().includes(searchText)
      );
    });
  }, [cards, keyword]);

  const openCreateModal = () => {
    setEditingCard(null);
    form.resetFields();
    setOpenModal(true);
  };

  const openEditModal = (card: CardType) => {
    setEditingCard(card);
    form.setFieldsValue({
      front: card.front,
      back: card.back,
    });
    setOpenModal(true);
  };

  const handleSubmit = async () => {
    if (!deckId) return;
    try {
      const values = await form.validateFields();

      if (editingCard) {
        await updateCard(editingCard.id, {
          front: values.front,
          back: values.back,
        });
        message.success('Đã cập nhật thẻ');
      } else {
        await createCardInDeck(deckId, {
          front: values.front,
          back: values.back,
        });
        message.success('Đã thêm thẻ mới');
      }

      form.resetFields();
      setOpenModal(false);
      setEditingCard(null);
      reloadPage();
    } catch (error: any) {
      if (error.errorFields) return;
      message.error(error.response?.data?.message || 'Lưu thẻ thất bại');
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      await deleteCard(cardId);
      message.success('Đã xóa thẻ');
      reloadPage();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Xóa thẻ thất bại');
    }
  };

  const handleToggleReviewFlag = async (cardId: string) => {
    try {
      await toggleReviewFlag(cardId);
      reloadPage();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Cập nhật cờ xem lại thất bại');
    }
  };

  const getStatusTag = (status: string) => {
    if (status === 'mastered') {
      return <Tag color="green">Đã thuộc</Tag>;
    }
    if (status === 'not_mastered') {
      return <Tag color="red">Chưa thuộc</Tag>;
    }
    return <Tag color="blue">Mới</Tag>;
  };

  const columns = [
    {
      title: 'Mặt trước',
      dataIndex: 'front',
      key: 'front',
      render: (text: string) => (
        <div dangerouslySetInnerHTML={{ __html: text || '' }} />
      ),
    },
    {
      title: 'Mặt sau',
      dataIndex: 'back',
      key: 'back',
      render: (text: string) => (
        <div dangerouslySetInnerHTML={{ __html: text || '' }} />
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Số lần học',
      dataIndex: 'reviewCount',
      key: 'reviewCount',
      width: 110,
      responsive: ['md'] as any,
      render: (value: number) => value || 0,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_: any, record: CardType) => (
        <Space size="middle">
          <Tooltip title={record.reviewFlag ? 'Bỏ cờ cần xem lại' : 'Đánh dấu cần xem lại'}>
            <Button
              type="text"
              icon={record.reviewFlag ? <StarFilled style={{ color: '#faad14', fontSize: '16px' }} /> : <StarOutlined style={{ fontSize: '16px' }} />}
              onClick={() => handleToggleReviewFlag(record.id)}
              style={{ padding: 0, height: 'auto', border: 'none', background: 'transparent' }}
            />
          </Tooltip>

          <Tooltip title="Sửa thẻ">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#1890ff', fontSize: '16px' }} />}
              onClick={() => openEditModal(record)}
              style={{ padding: 0, height: 'auto', border: 'none', background: 'transparent' }}
            />
          </Tooltip>

          <Popconfirm
            title="Xóa thẻ này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDeleteCard(record.id)}
          >
            <Tooltip title="Xóa thẻ">
              <Button
                danger
                type="text"
                icon={<DeleteOutlined style={{ fontSize: '16px' }} />}
                style={{ padding: 0, height: 'auto', border: 'none', background: 'transparent' }}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const studyOptionsContent = (
    <div style={{ padding: '8px 4px', width: '220px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <Text style={{ fontSize: '14px', fontWeight: 500 }}>Trộn thẻ ngẫu nhiên</Text>
        <Switch
          size="small"
          checked={shuffle}
          onChange={(val) => saveSettings(val, reviewOnly)}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: '14px', fontWeight: 500 }}>Chỉ ôn thẻ xem lại</Text>
        <Switch
          size="small"
          checked={reviewOnly}
          onChange={(val) => saveSettings(shuffle, val)}
          disabled={cards.filter((c) => c.reviewFlag).length === 0}
        />
      </div>
    </div>
  );

  if (loading && !deck) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', width: '100%', background: '#ffffff' }}>
        <div className="dino-animation" style={{ fontSize: '64px', marginBottom: '16px' }}>🦕</div>
        <div className="splash-spinner-container">
          <div className="splash-spinner"></div>
        </div>
        <div className="splash-text">Đang tải thông tin bộ thẻ...</div>
      </div>
    );
  }

  if (!deck && !loading) {
    return (
      <Card style={{ margin: 24, borderRadius: 16 }}>
        <Empty description="Không tìm thấy bộ thẻ" />
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={() => history.push('/')}
        >
          Quay về trang chủ
        </Button>
      </Card>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => history.push('/')}
            style={{ marginBottom: 12 }}
          >
            Quay lại
          </Button>

          <Title level={2}>{deck?.name}</Title>

          <Text type="secondary">
            {deck?.description || 'Bộ thẻ này chưa có mô tả'}
          </Text>

          <div style={{ marginTop: 12 }}>
            <Space wrap>
              {deck?.tags?.map((tag) => (
                <Tag color="green" key={tag}>
                  {tag}
                </Tag>
              ))}
            </Space>
          </div>
        </div>

        <Space>
          <Button.Group>
            <Button
              type="primary"
              onClick={() => history.push(`/decks/${deckId}/study?autoStart=true`)}
              disabled={cards.length === 0}
            >
              Bắt đầu học
            </Button>
            <Popover
              content={studyOptionsContent}
              title={<span style={{ fontWeight: 600, color: '#2e3856' }}>Tùy chọn học</span>}
              trigger="click"
              placement="bottomRight"
            >
              <Button
                type="primary"
                icon={<SettingOutlined />}
                style={{ paddingLeft: '8px', paddingRight: '8px' }}
              />
            </Popover>
          </Button.Group>

          <Button
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Thêm thẻ
          </Button>
        </Space>
      </div>

      <Card loading={loading} style={{ borderRadius: 16 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Input.Search
            placeholder="Tìm kiếm theo mặt trước, mặt sau..."
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            allowClear
          />

          <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredCards}
            pagination={{ pageSize: 8 }}
            locale={{
              emptyText: 'Chưa có thẻ nào trong bộ này',
            }}
          />
        </Space>
      </Card>

      <AntdModal
        forceRender
        title={editingCard ? 'Sửa thẻ' : 'Thêm thẻ mới'}
        open={openModal}
        onOk={handleSubmit}
        onCancel={() => {
          setOpenModal(false);
          setEditingCard(null);
          form.resetFields();
        }}
        okText={editingCard ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
        width={640}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Mặt trước - Câu hỏi / Từ"
            name="front"
            rules={[{ required: true, message: 'Vui lòng nhập mặt trước' }]}
          >
            <TinyEditor placeholder="Ví dụ: T-Rex" minHeight={120} />
          </Form.Item>

          <Form.Item
            label="Mặt sau - Đáp án / Định nghĩa"
            name="back"
            rules={[{ required: true, message: 'Vui lòng nhập mặt sau' }]}
          >
            <TinyEditor placeholder="Ví dụ: Khủng long bạo chúa" minHeight={120} />
          </Form.Item>
        </Form>
      </AntdModal>
    </>
  );
};

export default DeckDetailPage;
