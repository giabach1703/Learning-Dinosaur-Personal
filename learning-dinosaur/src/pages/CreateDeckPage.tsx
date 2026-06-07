import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  Select,
  Space,
  Typography,
  message,
  Switch,
  Tooltip,
  Popover,
} from 'antd';
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  PlusOutlined,
  SaveOutlined,
  RocketOutlined,
  GlobalOutlined,
  LockOutlined,
  PictureOutlined,
  AudioOutlined,
  BgColorsOutlined,
  FontColorsOutlined,
  SearchOutlined,
  SwapOutlined,
  DragOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { history } from 'umi';
import { createCardInDeck, createDeck, getAllTags } from '../services';
import TinyEditor from '../components/TinyEditor';

const { Title, Text } = Typography;

const LANGUAGES_OF_USER = ['Tiếng Anh', 'tiếng Tây Ban Nha'];
const TOP_LANGUAGES = ['Tiếng Trung (Pinyin)', 'Tiếng Nhật', 'Tiếng Pháp', 'Tiếng Hàn', 'Tiếng Đức'];
const ALL_LANGUAGES = [
  'Tiếng Afrikaans',
  'Akan',
  'tiếng Akkad',
  'người Albania',
  'Ngôn ngữ ký hiệu Mỹ',
  'Tiếng Ả Rập',
  'Tiếng Bồ Đào Nha',
  'Tiếng Nga',
  'Tiếng Ý',
  'Tiếng Thái',
  'Tiếng Việt',
  'Tiếng Latinh',
  'Tiếng Ba Lan',
  'Tiếng Hà Lan',
  'Tiếng Thụy Điển',
  'Tiếng Thổ Nhĩ Kỳ',
  'Tiếng Hy Lạp',
  'Tiếng Hindi'
];

interface LanguagePickerProps {
  currentValue: string;
  onSelect: (lang: string) => void;
}

const LanguagePicker: React.FC<LanguagePickerProps> = ({ currentValue, onSelect }) => {
  const [visible, setVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelect = (lang: string) => {
    onSelect(lang);
    setVisible(false);
    setSearchQuery('');
  };

  const filteredUserLangs = LANGUAGES_OF_USER.filter(l => l.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredTopLangs = TOP_LANGUAGES.filter(l => l.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredAllLangs = ALL_LANGUAGES.filter(l => l.toLowerCase().includes(searchQuery.toLowerCase()));

  const hasResults = filteredUserLangs.length > 0 || filteredTopLangs.length > 0 || filteredAllLangs.length > 0;

  const content = (
    <div style={{ width: '280px', padding: '8px 4px' }}>
      <Input
        placeholder="Ngôn ngữ tìm kiếm"
        prefix={<SearchOutlined style={{ color: '#939bb4', marginRight: '4px' }} />}
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        style={{
          borderRadius: '8px',
          background: '#f6f7fb',
          border: 'none',
          padding: '8px 12px',
          marginBottom: '12px'
        }}
      />
      <div style={{ maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }} className="dino-scroll">
        {searchQuery ? (
          <div>
            {!hasResults ? (
              <div style={{ padding: '12px 8px', color: '#939bb4', textAlign: 'center' }}>Không tìm thấy ngôn ngữ</div>
            ) : (
              <>
                {filteredUserLangs.map(lang => (
                  <div
                    key={lang}
                    onClick={() => handleSelect(lang)}
                    style={{ padding: '10px 12px', cursor: 'pointer', borderRadius: '6px', color: '#2e3856', fontWeight: 500 }}
                    className="lang-item-hover"
                  >
                    {lang}
                  </div>
                ))}
                {filteredTopLangs.map(lang => (
                  <div
                    key={lang}
                    onClick={() => handleSelect(lang)}
                    style={{ padding: '10px 12px', cursor: 'pointer', borderRadius: '6px', color: '#2e3856', fontWeight: 500 }}
                    className="lang-item-hover"
                  >
                    {lang}
                  </div>
                ))}
                {filteredAllLangs.map(lang => (
                  <div
                    key={lang}
                    onClick={() => handleSelect(lang)}
                    style={{ padding: '10px 12px', cursor: 'pointer', borderRadius: '6px', color: '#2e3856', fontWeight: 500 }}
                    className="lang-item-hover"
                  >
                    {lang}
                  </div>
                ))}
              </>
            )}
          </div>
        ) : (
          <>
            {/* Ngôn ngữ của bạn */}
            <div>
              <div style={{ fontSize: '11px', color: '#939bb4', fontWeight: 700, padding: '4px 12px 8px 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Ngôn ngữ của bạn
              </div>
              {filteredUserLangs.map(lang => (
                <div
                  key={lang}
                  onClick={() => handleSelect(lang)}
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    color: '#2e3856',
                    fontWeight: 500,
                    backgroundColor: currentValue === lang ? '#f0f3ff' : 'transparent'
                  }}
                  className="lang-item-hover"
                >
                  {lang}
                </div>
              ))}
            </div>

            <div style={{ height: '1px', background: '#edeff4', margin: '8px 0' }} />

            {/* Các ngôn ngữ hàng đầu */}
            <div>
              <div style={{ fontSize: '11px', color: '#939bb4', fontWeight: 700, padding: '8px 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Các ngôn ngữ hàng đầu trên Dinosaur
              </div>
              {filteredTopLangs.map(lang => (
                <div
                  key={lang}
                  onClick={() => handleSelect(lang)}
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    color: '#2e3856',
                    fontWeight: 500,
                    backgroundColor: currentValue === lang ? '#f0f3ff' : 'transparent'
                  }}
                  className="lang-item-hover"
                >
                  {lang}
                </div>
              ))}
            </div>

            <div style={{ height: '1px', background: '#edeff4', margin: '8px 0' }} />

            {/* Tất cả các ngôn ngữ */}
            <div>
              <div style={{ fontSize: '11px', color: '#939bb4', fontWeight: 700, padding: '8px 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Tất cả các ngôn ngữ
              </div>
              {filteredAllLangs.map(lang => (
                <div
                  key={lang}
                  onClick={() => handleSelect(lang)}
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    color: '#2e3856',
                    fontWeight: 500,
                    backgroundColor: currentValue === lang ? '#f0f3ff' : 'transparent'
                  }}
                  className="lang-item-hover"
                >
                  {lang}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={visible}
      onOpenChange={setVisible}
      placement="bottomLeft"
      overlayClassName="quizlet-lang-popover"
      overlayInnerStyle={{ borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', padding: '8px' }}
    >
      <span style={{ color: '#4257b2', cursor: 'pointer', textTransform: 'uppercase' }}>
        {currentValue}
      </span>
    </Popover>
  );
};

interface LocalCard {
  id: string;
  front: string;
  back: string;
  frontLanguage: string;
  backLanguage: string;
  imageUrl?: string;
}

function createEmptyCard(): LocalCard {
  return {
    id: String(Math.random()),
    front: '',
    back: '',
    frontLanguage: 'CHỌN NGÔN NGỮ',
    backLanguage: 'CHỌN NGÔN NGỮ',
    imageUrl: '',
  };
}

const CreateDeckPage: React.FC = () => {
  const [form] = Form.useForm();
  const [cards, setCards] = useState<LocalCard[]>([
    createEmptyCard(),
    createEmptyCard(),
    createEmptyCard(),
  ]);
  const [tagOptions, setTagOptions] = useState<{ label: string; value: string }[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(true);

  useEffect(() => {
    // Hiệu ứng load dữ liệu cho trang
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function loadTags() {
      try {
        const tags = await getAllTags();
        setTagOptions(
          Array.isArray(tags)
            ? tags.map((tag) => ({
                label: tag,
                value: tag,
              }))
            : []
        );
      } catch {
        setTagOptions([]);
      }
    }

    loadTags();
  }, []);

  const validCards = useMemo(() => {
    return cards.filter(
      (card) => card.front.trim() !== '' && card.back.trim() !== ''
    );
  }, [cards]);

  const updateCard = (cardId: string, field: 'front' | 'back' | 'frontLanguage' | 'backLanguage' | 'imageUrl', value: string) => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === cardId
          ? {
              ...card,
              [field]: value,
            }
          : card
      )
    );
  };

  const addCard = () => {
    setCards((prevCards) => [...prevCards, createEmptyCard()]);
  };

  const removeCard = (cardId: string) => {
    if (cards.length <= 1) {
      message.warning('Bộ thẻ cần có ít nhất 1 thẻ');
      return;
    }
    setCards((prevCards) => prevCards.filter((card) => card.id !== cardId));
  };

  const validateCards = () => {
    if (validCards.length === 0) {
      message.error('Vui lòng nhập ít nhất 1 thẻ đầy đủ Mặt trước và Mặt sau');
      return false;
    }

    const hasHalfFilledCard = cards.some((card) => {
      const hasFront = card.front.trim() !== '';
      const hasBack = card.back.trim() !== '';
      return hasFront !== hasBack;
    });

    if (hasHalfFilledCard) {
      message.error(
        'Có thẻ chỉ mới nhập một mặt. Vui lòng nhập đủ cả hai mặt hoặc xóa dòng đó'
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (practiceAfterCreate = false) => {
    try {
      const values = await form.validateFields();
      setShowError(false);

      if (!validateCards()) {
        return;
      }

      setSubmitting(true);

      const deck = await createDeck({
        name: values.name,
        description: values.description || '',
        tags: values.tags || [],
      });

      await Promise.all(
        validCards.map((card) =>
          createCardInDeck(deck.id, {
            front: card.front.trim(),
            back: card.back.trim(),
            imageUrl: card.imageUrl || undefined,
            frontLanguage: card.frontLanguage !== 'CHỌN NGÔN NGỮ' ? card.frontLanguage : undefined,
            backLanguage: card.backLanguage !== 'CHỌN NGÔN NGỮ' ? card.backLanguage : undefined,
          })
        )
      );

      // Tự động thêm bộ thẻ vào thư mục nếu có tham số folderId
      const params = new URLSearchParams(window.location.search);
      const folderId = params.get('folderId');
      if (folderId) {
        try {
          const storedFolders = localStorage.getItem('dino_folders');
          if (storedFolders) {
            const folders = JSON.parse(storedFolders);
            const folderIndex = folders.findIndex((f: any) => f.id === folderId);
            if (folderIndex > -1) {
              if (!folders[folderIndex].deckIds.includes(deck.id)) {
                folders[folderIndex].deckIds.push(deck.id);
                localStorage.setItem('dino_folders', JSON.stringify(folders));
              }
            }
          }
        } catch (e) {
          console.error('Lỗi khi tự động thêm bộ thẻ vào thư mục:', e);
        }
      }

      message.success(`Đã tạo bộ thẻ thành công với ${validCards.length} thẻ`);

      if (practiceAfterCreate) {
        history.push(`/decks/${deck.id}/study`);
      } else if (folderId) {
        history.push(`/?folderId=${folderId}`);
      } else {
        history.push(`/decks/${deck.id}`);
      }
    } catch (error: any) {
      if (error.errorFields) {
        setShowError(true);
        message.error('Vui lòng điền tiêu đề bộ thẻ!');
        return;
      }
      message.error(error.response?.data?.message || 'Tạo bộ thẻ thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageFileChange = (cardId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      message.error('Vui lòng chọn tệp hình ảnh hợp lệ (png, jpg, jpeg...)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateCard(cardId, 'imageUrl', reader.result);
      }
    };
    reader.onerror = () => {
      message.error('Lỗi khi đọc file ảnh');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (cardId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    updateCard(cardId, 'imageUrl', '');
  };

  if (pageLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', width: '100%', background: '#ffffff' }}>
        <div className="dino-animation">🦕</div>
        <div className="splash-spinner-container">
          <div className="splash-spinner"></div>
        </div>
        <div className="splash-text">Đang tải biểu mẫu tạo thẻ học...</div>
      </div>
    );
  }

  return (
    <div className="quizlet-create-page" style={{ background: '#ffffff', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Header Panel */}
      <div className="quizlet-create-header" style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        margin: '0 0 24px 0',
        padding: '16px 24px',
        background: '#ffffff',
        borderBottom: '1px solid #edf0ee',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <Space size="middle">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined style={{ fontSize: '16px', color: '#586380' }} />} 
            onClick={() => history.push('/')}
            style={{ borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />
          <Title level={4} style={{ color: '#2e3856', fontWeight: 800, margin: 0 }}>
            Tạo bộ thẻ học mới
          </Title>
        </Space>

        <Space size="middle">
          <Button
            onClick={() => handleSubmit(false)}
            loading={submitting}
            style={{
              background: '#f6f7fb',
              borderColor: 'transparent',
              color: '#4257b2',
              fontWeight: 700,
              borderRadius: '8px',
              height: '40px',
              padding: '0 24px'
            }}
          >
            Tạo nên
          </Button>

          <Button
            type="primary"
            onClick={() => handleSubmit(true)}
            loading={submitting}
            style={{
              background: '#2563eb',
              borderColor: '#2563eb',
              color: '#ffffff',
              fontWeight: 700,
              borderRadius: '8px',
              height: '40px',
              padding: '0 24px',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
            }}
          >
            Sáng tạo và thực hành
          </Button>
        </Space>
      </div>

      <div className="quizlet-create-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 16px' }}>
        {/* Status Indicator Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', color: '#586380', fontSize: '13px' }}>
          <Space style={{ background: '#eef2ff', color: '#4f46e5', fontWeight: 600, padding: '4px 10px', borderRadius: '6px', fontSize: '12px' }}>
            <GlobalOutlined />
            <span>Công cộng</span>
          </Space>
          <span>Đã lưu cách đây chưa đầy 1 phút</span>
        </div>

        {/* Error message */}
        {showError && (
          <div style={{
            background: '#fff5f5',
            border: '1px solid #feb2b2',
            color: '#c53030',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontWeight: 600,
            fontSize: '13px'
          }}>
            Vui lòng nhập tiêu đề để tạo bộ sưu tập của bạn.
          </div>
        )}

        {/* Form Meta */}
        <Form form={form} layout="vertical" className="quizlet-create-form" style={{ marginBottom: '32px' }}>
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
            style={{ marginBottom: '16px' }}
          >
            <Input
              style={{
                height: '56px',
                fontSize: '18px',
                fontWeight: 700,
                borderRadius: '10px',
                border: showError ? '2px solid #e53e3e' : '1px solid #d9d9d9',
                padding: '0 16px'
              }}
              placeholder="Nhập tiêu đề, ví dụ: Thuật ngữ Khủng Long"
            />
          </Form.Item>

          <Form.Item name="description" style={{ marginBottom: '16px' }}>
            <Input.TextArea
              placeholder="Thêm mô tả..."
              rows={3}
              style={{
                borderRadius: '10px',
                padding: '12px 16px',
                fontSize: '14px',
              }}
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item label={<Text strong style={{ color: '#2e3856' }}>Tag phân loại</Text>} name="tags">
            <Select
              mode="tags"
              placeholder="Ví dụ: toeic, tiếng-anh, khảo-cổ"
              options={tagOptions}
              style={{ width: '100%' }}
              dropdownStyle={{ borderRadius: '8px' }}
            />
          </Form.Item>
        </Form>

        {/* Toolbar Utility Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: '16px',
          borderBottom: '1px solid #edf0ee',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <Space size="middle">
            <Tooltip title="Gợi ý đáp án">
              <Space>
                <Text style={{ fontSize: '13px', color: '#586380', fontWeight: 600 }}>Gợi ý</Text>
                <Switch size="small" defaultChecked />
              </Space>
            </Tooltip>
            <Tooltip title="Tìm kiếm">
              <Button type="text" icon={<SearchOutlined style={{ color: '#586380', fontSize: '16px' }} />} />
            </Tooltip>
            <Tooltip title="Hoán đổi mặt thẻ">
              <Button type="text" icon={<SwapOutlined style={{ color: '#586380', fontSize: '16px' }} />} />
            </Tooltip>
            <Tooltip title="Xóa tất cả các thẻ">
              <Button type="text" danger icon={<DeleteOutlined style={{ fontSize: '16px' }} />} />
            </Tooltip>
          </Space>
        </div>

        {/* Card Editors List */}
        <div className="quizlet-card-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {cards.map((card, index) => (
            <Card
              key={card.id}
              style={{
                borderRadius: '16px',
                border: '1px solid #edf0ee',
                boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
                background: '#ffffff',
                overflow: 'hidden'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              {/* Card Header Toolbar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #f6f7fb',
                paddingBottom: '12px',
                marginBottom: '16px'
              }}>
                <Text strong style={{ fontSize: '18px', color: '#939bb4' }}>
                  {index + 1}
                </Text>

                {/* Mid Format Toolbar */}
                <Space size="middle" style={{ background: '#f8fafc', padding: '4px 12px', borderRadius: '20px', border: '1px dashed #e2e8f0' }}>
                  <FontColorsOutlined style={{ color: '#586380', cursor: 'pointer' }} />
                  <BgColorsOutlined style={{ color: '#586380', cursor: 'pointer' }} />
                  <AudioOutlined style={{ color: '#586380', cursor: 'pointer' }} />
                  <LockOutlined style={{ color: '#eab308', cursor: 'pointer' }} title="Tính năng Premium" />
                </Space>

                <Space>
                  <Tooltip title="Di chuyển">
                    <Button type="text" icon={<DragOutlined style={{ color: '#939bb4', fontSize: '16px' }} />} />
                  </Tooltip>
                  <Tooltip title="Xóa thẻ này">
                    <Button
                      danger
                      type="text"
                      icon={<DeleteOutlined style={{ fontSize: '16px' }} />}
                      onClick={() => removeCard(card.id)}
                    />
                  </Tooltip>
                </Space>
              </div>

              {/* Card Body Columns */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr auto',
                gap: '24px',
                alignItems: 'flex-start'
              }} className="quizlet-card-editor-grid">
                
                {/* Term Input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{
                    borderBottom: '2px solid #586380',
                    paddingBottom: '4px'
                  }}>
                    <TinyEditor
                      value={card.front}
                      placeholder="Enter term"
                      onChange={(val) => updateCard(card.id, 'front', val)}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#939bb4', fontWeight: 700, marginTop: '4px' }}>
                    <span>THUẬT NGỮ</span>
                    <LanguagePicker currentValue={card.frontLanguage} onSelect={(lang) => updateCard(card.id, 'frontLanguage', lang)} />
                  </div>
                </div>

                {/* Definition Input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{
                    borderBottom: '2px solid #586380',
                    paddingBottom: '4px'
                  }}>
                    <TinyEditor
                      value={card.back}
                      placeholder="Enter definition"
                      onChange={(val) => updateCard(card.id, 'back', val)}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#939bb4', fontWeight: 700, marginTop: '4px' }}>
                    <span>SỰ ĐỊNH NGHĨA</span>
                    <LanguagePicker currentValue={card.backLanguage} onSelect={(lang) => updateCard(card.id, 'backLanguage', lang)} />
                  </div>
                </div>

                {/* Image Uploader & Preview */}
                <input
                  type="file"
                  accept="image/*"
                  id={`image-input-${card.id}`}
                  style={{ display: 'none' }}
                  onChange={(e) => handleImageFileChange(card.id, e)}
                />
                <div
                  onClick={() => document.getElementById(`image-input-${card.id}`)?.click()}
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '8px',
                    border: card.imageUrl ? '1px solid #cbd5e1' : '2px dashed #cbd5e1',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    background: '#f8fafc',
                    transition: 'all 0.2s',
                    gap: '4px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  className="card-image-uploader-box"
                >
                  {card.imageUrl ? (
                    <>
                      <img
                        src={card.imageUrl}
                        alt="Card visual"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div
                        onClick={(e) => handleRemoveImage(card.id, e)}
                        style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          background: 'rgba(0,0,0,0.6)',
                          color: '#ffffff',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          cursor: 'pointer',
                          zIndex: 5
                        }}
                      >
                        <CloseOutlined />
                      </div>
                    </>
                  ) : (
                    <>
                      <PictureOutlined style={{ fontSize: '18px', color: '#94a3b8' }} />
                      <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>Hình ảnh</span>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Add Card Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px', marginBottom: '32px' }}>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={addCard}
            style={{
              width: '100%',
              height: '56px',
              borderRadius: '16px',
              border: '2px dashed #4257b2',
              color: '#4257b2',
              fontWeight: 700,
              fontSize: '15px',
              background: '#ffffff'
            }}
          >
            Thêm thẻ
          </Button>
        </div>

        {/* Bottom Action Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', borderTop: '1px solid #edf0ee', paddingTop: '24px' }}>
          <Button
            onClick={() => handleSubmit(false)}
            loading={submitting}
            style={{
              background: '#f6f7fb',
              borderColor: 'transparent',
              color: '#4257b2',
              fontWeight: 700,
              borderRadius: '8px',
              height: '40px',
              padding: '0 24px'
            }}
          >
            Tạo nên
          </Button>

          <Button
            type="primary"
            onClick={() => handleSubmit(true)}
            loading={submitting}
            style={{
              background: '#2563eb',
              borderColor: '#2563eb',
              color: '#ffffff',
              fontWeight: 700,
              borderRadius: '8px',
              height: '40px',
              padding: '0 24px',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
            }}
          >
            Sáng tạo và thực hành
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateDeckPage;
