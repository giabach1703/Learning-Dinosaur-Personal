import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Button, Empty, Input, Space, Spin, Typography, message, Card, Modal, Row, Col, Tag, Checkbox, Tabs } from 'antd';
import { PlusOutlined, SearchOutlined, RocketOutlined, BorderOuterOutlined, FolderOutlined, BookOutlined } from '@ant-design/icons';
import { history, useModel, useLocation } from 'umi';
import DeckCard from '../components/deck/DeckCard';
import DeckFormModal from './components/Modal';
import TagFilter from '../components/deck/TagFilter';
import StreakBanner from '../components/gamification/StreakBanner';
import { Deck } from '../services/typing';
import GameBlastModal from '../components/game/GameBlastModal';
import GameTetrisModal from '../components/game/GameTetrisModal';

const { Title, Text } = Typography;

const HomePage: React.FC = () => {
  const { decks, tags, loading, loadDecks, loadTags } = useModel('useDeckModel');
  const location = useLocation();

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [keyword, setKeyword] = useState<string>(() => {
    return new URLSearchParams(location.search).get('q') || '';
  });
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [folderUpdateTrigger, setFolderUpdateTrigger] = useState<number>(0);
  const [addDeckModalVisible, setAddDeckModalVisible] = useState<boolean>(false);
  const [tempSelectedDecks, setTempSelectedDecks] = useState<string[]>([]);

  const [blastVisible, setBlastVisible] = useState<boolean>(false);
  const [tetrisVisible, setTetrisVisible] = useState<boolean>(false);

  const [personalizationVisible, setPersonalizationVisible] = useState<boolean>(false);
  const [schoolInfo, setSchoolInfo] = useState<{ school: string; major: string }>(() => {
    try {
      const stored = localStorage.getItem('dino_school_info');
      return stored ? JSON.parse(stored) : { school: '', major: '' };
    } catch {
      return { school: '', major: '' };
    }
  });
  const [tempSchool, setTempSchool] = useState<string>('');
  const [tempMajor, setTempMajor] = useState<string>('');

  const [initialFetchDone, setInitialFetchDone] = useState<boolean>(false);
  const [hasStartedLoading, setHasStartedLoading] = useState<boolean>(false);

  const { folderId, tab } = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      folderId: params.get('folderId'),
      tab: params.get('tab'),
    };
  }, [location.search]);

  const currentFolder = useMemo(() => {
    if (!folderId) return null;
    try {
      const stored = localStorage.getItem('dino_folders');
      if (stored) {
        const folders = JSON.parse(stored);
        return folders.find((f: any) => f.id === folderId) || null;
      }
    } catch {
      // Ignored
    }
    return null;
  }, [folderId, folderUpdateTrigger]);

  const reloadAll = useCallback(async () => {
    try {
      await Promise.all([loadDecks(), loadTags()]);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không tải được danh sách dữ liệu');
    }
  }, [loadDecks, loadTags]);

  useEffect(() => {
    reloadAll();
  }, [reloadAll]);

  useEffect(() => {
    if (loading) {
      setHasStartedLoading(true);
    }
  }, [loading]);

  useEffect(() => {
    if (hasStartedLoading && !loading) {
      const timer = setTimeout(() => {
        setInitialFetchDone(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [loading, hasStartedLoading]);

  const filteredDecks = useMemo(() => {
    let safeDecks = Array.isArray(decks) ? decks : [];

    if (currentFolder) {
      safeDecks = safeDecks.filter(deck => currentFolder.deckIds.includes(deck.id));
    }

    return safeDecks.filter((deck) => {
      const searchText = keyword.toLowerCase();

      const matchKeyword =
        (deck?.name || '').toLowerCase().includes(searchText) ||
        (deck?.description || '').toLowerCase().includes(searchText) ||
        deck?.tags?.some((tag) => tag.toLowerCase().includes(searchText));

      const matchTag = selectedTag ? deck?.tags?.includes(selectedTag) : true;

      return matchKeyword && matchTag;
    });
  }, [decks, keyword, selectedTag, currentFolder, folderUpdateTrigger]);

  const handleCreate = () => {
    history.push('/decks/new');
  };

  const handleEdit = (deck: Deck) => {
    setEditingDeck(deck);
    setOpenModal(true);
  };

  const openPersonalization = () => {
    setTempSchool(schoolInfo.school);
    setTempMajor(schoolInfo.major);
    setPersonalizationVisible(true);
  };

  const savePersonalization = () => {
    const info = { school: tempSchool.trim(), major: tempMajor.trim() };
    setSchoolInfo(info);
    localStorage.setItem('dino_school_info', JSON.stringify(info));
    message.success('Cập nhật thông tin cá nhân hóa thành công!');
    setPersonalizationVisible(false);
  };

  useEffect(() => {
    if (addDeckModalVisible && currentFolder) {
      setTempSelectedDecks(currentFolder.deckIds || []);
    }
  }, [addDeckModalVisible, currentFolder]);

  const handleSaveDecksToFolder = () => {
    if (!currentFolder) return;
    try {
      const stored = localStorage.getItem('dino_folders');
      if (stored) {
        const folders = JSON.parse(stored);
        const idx = folders.findIndex((f: any) => f.id === currentFolder.id);
        if (idx > -1) {
          folders[idx].deckIds = tempSelectedDecks;
          localStorage.setItem('dino_folders', JSON.stringify(folders));
          setFolderUpdateTrigger(prev => prev + 1);
          message.success('Đã cập nhật tài liệu học tập trong thư mục');
          setAddDeckModalVisible(false);
        }
      }
    } catch {
      message.error('Có lỗi xảy ra khi lưu');
    }
  };

  if (!initialFetchDone) {
    return (
      <div className="dashboard-splash-loader">
        <div className="splash-content">
          <div className="dino-animation">🦕</div>
          <div className="splash-logo">🦕 DinoStudy</div>
          <div className="splash-spinner-container">
            <div className="splash-spinner"></div>
          </div>
          <div className="splash-text">Đang chuẩn bị không gian học tập...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage-container" style={{ paddingBottom: '40px' }}>
      {currentFolder ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '12px', 
              background: '#ffffff', 
              border: '1px solid #edf0ee',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <FolderOutlined style={{ fontSize: '28px', color: '#586380' }} />
            </div>
            <div>
              <Title level={2} style={{ color: '#2e3856', fontWeight: 800, margin: 0 }}>
                {currentFolder.name}
              </Title>
              <Space style={{ marginTop: '8px' }} size="small">
                <Tag color="blue" style={{ borderRadius: '12px', padding: '2px 12px', fontWeight: 600, border: 'none' }}>Tất cả</Tag>
                <Tag style={{ borderRadius: '12px', padding: '2px 12px', fontWeight: 600, cursor: 'pointer', border: '1px dashed #cbd5e1' }} onClick={() => setAddDeckModalVisible(true)}>+ Nhãn</Tag>
              </Space>
            </div>
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAddDeckModalVisible(true)}
            style={{ background: '#2563eb', borderColor: '#2563eb', height: '40px', borderRadius: '8px', fontWeight: 600 }}
          >
            Thêm tài liệu học tập
          </Button>
        </div>
      ) : (
        <div className="page-header" style={{ marginBottom: '24px' }}>
          <div>
            <Title level={2} style={{ color: '#2e3856', fontWeight: 800, margin: 0 }}>
              {tab === 'library' ? 'Thư viện của bạn' : 'Bộ thẻ của bạn'}
            </Title>
            <Text type="secondary" style={{ fontSize: '14px' }}>
              Tạo deck, ôn tập flashcard và tích lũy XP hàng ngày.
            </Text>
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            style={{ background: '#2f855a', borderColor: '#2f855a', height: '40px', borderRadius: '8px', fontWeight: 600 }}
          >
            Tạo deck
          </Button>
        </div>
      )}

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        
        {!currentFolder && tab !== 'library' && <StreakBanner />}

        {!currentFolder && tab !== 'library' && (
          <div className="personalization-section" style={{ marginBottom: '8px' }}>
            <Text strong style={{ display: 'block', fontSize: '15px', color: '#2e3856', marginBottom: '12px' }}>
              Cá nhân hóa nội dung của bạn
            </Text>
            <Card
              style={{ borderRadius: '16px', border: '1px solid #edf0ee', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}
              bodyStyle={{ padding: '24px' }}
            >
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{ background: '#edeff9', color: '#4257b2', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
                  🎓
                </div>
                <div>
                  <Title level={4} style={{ color: '#2e3856', fontWeight: 700, margin: '0 0 8px 0', fontSize: '16px' }}>
                    {schoolInfo.school 
                      ? `Lộ trình học tập đề xuất cho ${schoolInfo.school}`
                      : 'Tìm nội dung mới nhất dựa trên các khóa học của bạn.'
                    }
                  </Title>
                  <Text type="secondary" style={{ display: 'block', marginBottom: '16px', fontSize: '13px' }}>
                    {schoolInfo.major 
                      ? `Lĩnh vực quan tâm: ${schoolInfo.major}. Chúng tôi sẽ tối ưu hóa các chủ đề từ vựng phù hợp.`
                      : 'Cung cấp thông tin trường học để chúng tôi đề xuất các bộ thẻ từ vựng sát sườn nhất.'
                    }
                  </Text>
                  <Button type="primary" onClick={openPersonalization} style={{ background: '#4257b2', borderColor: '#4257b2', borderRadius: '8px', fontWeight: 600 }}>
                    {schoolInfo.school ? 'Cập nhật thông tin' : 'Cập nhật trường học'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '12px 16px', border: '1px solid #edf0ee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center' }}>
            <TagFilter tags={tags} selectedTag={selectedTag} onChange={setSelectedTag} />
          </div>
          <Input
            size="middle"
            prefix={<SearchOutlined style={{ color: '#939bb4' }} />}
            placeholder="Tìm kiếm bộ thẻ..."
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            style={{ borderRadius: '8px', background: '#f6f7fb', border: '1px solid #edeff4', width: '280px', height: '36px' }}
          />
        </div>

        <div className="decks-list-section">
          <Text strong style={{ display: 'block', fontSize: '15px', color: '#2e3856', marginBottom: '12px' }}>
            {currentFolder ? `Bộ thẻ trong thư mục` : tab === 'library' ? 'Tất cả tài liệu của bạn' : 'Những phát hiện mới mẻ'}
          </Text>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}><Spin size="large" /></div>
          ) : filteredDecks.length === 0 ? (
            currentFolder ? (
              <Card
                style={{
                  borderRadius: '20px',
                  border: '1px dashed #edf0ee',
                  background: '#ffffff',
                  padding: '60px 20px',
                  textAlign: 'center',
                  boxShadow: 'none'
                }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '48px', marginBottom: '8px' }}>
                    <span style={{ transform: 'rotate(-15deg)', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.08))', display: 'inline-block' }}>📘</span>
                    <span style={{ transform: 'translateY(-12px)', fontSize: '56px', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.08))', display: 'inline-block' }}>📒</span>
                    <span style={{ transform: 'rotate(15deg)', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.08))', display: 'inline-block' }}>📙</span>
                  </div>
                  <div>
                    <Text strong style={{ display: 'block', fontSize: '18px', color: '#2e3856', marginBottom: '4px' }}>
                      Hãy bắt đầu xây dựng thư mục của bạn.
                    </Text>
                  </div>
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => setAddDeckModalVisible(true)}
                    style={{
                      background: '#2563eb',
                      borderColor: '#2563eb',
                      borderRadius: '24px',
                      fontWeight: 700,
                      padding: '0 32px',
                      height: '48px',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                    }}
                  >
                    Thêm tài liệu học tập
                  </Button>
                </Space>
              </Card>
            ) : (
              <Empty description="Chưa có bộ thẻ phù hợp" style={{ padding: '30px 0' }} />
            )
          ) : (
            <div className="deck-grid">
              {filteredDecks.map((deck) => (
                <div key={deck.id} className="quizlet-deck-card-wrapper" style={{ transition: 'all 0.3s' }}>
                  <DeckCard deck={deck} onEdit={handleEdit} onReload={reloadAll} />
                </div>
              ))}
            </div>
          )}
        </div>

        {!currentFolder && tab !== 'library' && (
          <div className="games-section" style={{ marginTop: '12px' }}>
            <Text strong style={{ display: 'block', fontSize: '15px', color: '#2e3856', marginBottom: '16px' }}>
              Hãy giữ cho mọi thứ luôn mới mẻ.
            </Text>
            <Row gutter={[20, 20]}>
              {/* Game Blast */}
              <Col xs={24} md={12}>
                <Card
                  hoverable
                  onClick={() => setBlastVisible(true)}
                  style={{
                    borderRadius: '18px',
                    border: '1px solid #edf0ee',
                    overflow: 'hidden',
                    height: '100%',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
                  }}
                  bodyStyle={{ padding: 0 }}
                >
                  <Row style={{ height: '100%' }}>
                    <Col span={14} style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                          <RocketOutlined style={{ fontSize: '22px', color: '#38b000' }} />
                          <Tag color="success" style={{ borderRadius: '6px', fontWeight: 600 }}>Mini-game</Tag>
                        </div>
                        <Title level={4} style={{ color: '#2e3856', fontWeight: 800, fontSize: '16px', margin: '0 0 6px 0' }}>
                          Xin chào bằng nhiều ngôn ngữ khác nhau
                        </Title>
                        <Text type="secondary" style={{ fontSize: '13px' }}>
                          Hãy đưa ra câu trả lời đúng trước khi hết giờ để phá hủy thiên thạch từ vựng!
                        </Text>
                      </div>
                      <Button 
                        type="primary" 
                        size="middle" 
                        style={{ background: '#4257b2', borderColor: '#4257b2', borderRadius: '8px', fontWeight: 700, width: 'fit-content', marginTop: '16px' }}
                      >
                        Chơi Blast
                      </Button>
                    </Col>
                    <Col span={10} style={{ 
                      background: 'linear-gradient(135deg, #0b0f19 0%, #1c103f 100%)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      minHeight: '160px'
                    }}>
                      <div style={{ fontSize: '64px', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.2))' }}>🚀</div>
                      <div style={{ position: 'absolute', top: '15px', right: '15px', fontSize: '20px' }}>⭐</div>
                      <div style={{ position: 'absolute', bottom: '20px', left: '20px', fontSize: '14px' }}>🪐</div>
                    </Col>
                  </Row>
                </Card>
              </Col>

              {/* Game Tetris */}
              <Col xs={24} md={12}>
                <Card
                  hoverable
                  onClick={() => setTetrisVisible(true)}
                  style={{
                    borderRadius: '18px',
                    border: '1px solid #edf0ee',
                    overflow: 'hidden',
                    height: '100%',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
                  }}
                  bodyStyle={{ padding: 0 }}
                >
                  <Row style={{ height: '100%' }}>
                    <Col span={14} style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                          <BorderOuterOutlined style={{ fontSize: '22px', color: '#ffb703' }} />
                          <Tag color="warning" style={{ borderRadius: '6px', fontWeight: 600 }}>Mini-game</Tag>
                        </div>
                        <Title level={4} style={{ color: '#2e3856', fontWeight: 800, fontSize: '16px', margin: '0 0 6px 0' }}>
                          Cờ thế giới
                        </Title>
                        <Text type="secondary" style={{ fontSize: '13px' }}>
                          Trả lời đúng để nhận thêm lượt chơi và xếp gạch Tetris cực vui!
                        </Text>
                      </div>
                      <Button 
                        type="primary" 
                        size="middle" 
                        style={{ background: '#2f855a', borderColor: '#2f855a', borderRadius: '8px', fontWeight: 700, width: 'fit-content', marginTop: '16px' }}
                      >
                        Chơi Cờ thế giới
                      </Button>
                    </Col>
                    <Col span={10} style={{ 
                      background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)', 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center',
                      gap: '4px',
                      position: 'relative',
                      minHeight: '160px'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 12px)', gap: '2px' }}>
                        <div style={{ width: '12px', height: '12px', background: '#00f0f0', borderRadius: '2px' }}></div>
                        <div style={{ width: '12px', height: '12px', background: '#00f0f0', borderRadius: '2px' }}></div>
                        <div style={{ width: '12px', height: '12px', background: '#00f0f0', borderRadius: '2px' }}></div>
                        <div style={{ width: '12px', height: '12px', background: '#00f0f0', borderRadius: '2px' }}></div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 12px)', gap: '2px', marginLeft: '-14px' }}>
                        <div style={{ width: '12px', height: '12px', background: '#a000f0', borderRadius: '2px' }}></div>
                        <div style={{ width: '12px', height: '12px', background: '#a000f0', borderRadius: '2px' }}></div>
                        <div style={{ width: '12px', height: '12px', background: '#a000f0', borderRadius: '2px' }}></div>
                      </div>
                      <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '18px' }}>🧱</div>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Space>

      <DeckFormModal
        open={openModal}
        editingDeck={editingDeck}
        onClose={() => { setOpenModal(false); setEditingDeck(null); }}
        onSuccess={reloadAll}
      />

      <GameBlastModal visible={blastVisible} onCancel={() => setBlastVisible(false)} />
      <GameTetrisModal visible={tetrisVisible} onCancel={() => setTetrisVisible(false)} />

      <Modal title="Thiết lập thông tin cá nhân hóa" visible={personalizationVisible} onOk={savePersonalization} onCancel={() => setPersonalizationVisible(false)}>
        <Input placeholder="Tên trường học" value={tempSchool} onChange={(e) => setTempSchool(e.target.value)} style={{ marginBottom: 10 }} />
        <Input placeholder="Khóa học/Lĩnh vực" value={tempMajor} onChange={(e) => setTempMajor(e.target.value)} />
      </Modal>

      {/* Modal Thêm tài liệu học tập vào thư mục */}
      <Modal
        title={null}
        visible={addDeckModalVisible}
        onCancel={() => setAddDeckModalVisible(false)}
        footer={null}
        width={600}
        bodyStyle={{ padding: '24px' }}
        style={{ borderRadius: '20px', overflow: 'hidden' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={3} style={{ color: '#2e3856', fontWeight: 800, margin: 0 }}>
            Thêm vào {currentFolder?.name}
          </Title>
          <Button
            type="link"
            icon={<PlusOutlined />}
            onClick={() => {
              setAddDeckModalVisible(false);
              history.push(`/decks/new?folderId=${currentFolder?.id}`);
            }}
            style={{ color: '#2563eb', fontWeight: 700, padding: 0 }}
          >
            Tạo mới
          </Button>
        </div>

        <Tabs defaultActiveKey="library" style={{ marginBottom: '16px' }}>
          <Tabs.TabPane tab="Gần đây" key="recent">
            {decks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
                  Bạn chưa tạo hoặc nghiên cứu bất kỳ mục nào.
                </Text>
                <Button
                  type="primary"
                  onClick={() => {
                    setAddDeckModalVisible(false);
                    history.push(`/decks/new?folderId=${currentFolder?.id}`);
                  }}
                  style={{
                    background: '#2563eb',
                    borderColor: '#2563eb',
                    borderRadius: '20px',
                    fontWeight: 700
                  }}
                >
                  + Tạo mới
                </Button>
              </div>
            ) : (
              <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {decks.slice(0, 5).map(deck => {
                  const isChecked = tempSelectedDecks.includes(deck.id);
                  return (
                    <div
                      key={deck.id}
                      onClick={() => {
                        if (isChecked) {
                          setTempSelectedDecks(tempSelectedDecks.filter(id => id !== deck.id));
                        } else {
                          setTempSelectedDecks([...tempSelectedDecks, deck.id]);
                        }
                      }}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: isChecked ? '2px solid #2563eb' : '1px solid #edf0ee',
                        background: isChecked ? '#f5f8ff' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div>
                        <Text strong style={{ color: '#2e3856', display: 'block' }}>{deck.name}</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>{deck.totalCards} thẻ</Text>
                      </div>
                      <Checkbox checked={isChecked} onClick={(e) => e.stopPropagation()} onChange={(e) => {
                        if (e.target.checked) {
                          setTempSelectedDecks([...tempSelectedDecks, deck.id]);
                        } else {
                          setTempSelectedDecks(tempSelectedDecks.filter(id => id !== deck.id));
                        }
                      }} />
                    </div>
                  );
                })}
              </div>
            )}
          </Tabs.TabPane>

          <Tabs.TabPane tab="Thư viện của bạn" key="library">
            {decks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
                  Bạn chưa tạo hoặc nghiên cứu bất kỳ mục nào.
                </Text>
                <Button
                  type="primary"
                  onClick={() => {
                    setAddDeckModalVisible(false);
                    history.push(`/decks/new?folderId=${currentFolder?.id}`);
                  }}
                  style={{
                    background: '#2563eb',
                    borderColor: '#2563eb',
                    borderRadius: '20px',
                    fontWeight: 700
                  }}
                >
                  + Tạo mới
                </Button>
              </div>
            ) : (
              <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {decks.map(deck => {
                  const isChecked = tempSelectedDecks.includes(deck.id);
                  return (
                    <div
                      key={deck.id}
                      onClick={() => {
                        if (isChecked) {
                          setTempSelectedDecks(tempSelectedDecks.filter(id => id !== deck.id));
                        } else {
                          setTempSelectedDecks([...tempSelectedDecks, deck.id]);
                        }
                      }}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: isChecked ? '2px solid #2563eb' : '1px solid #edf0ee',
                        background: isChecked ? '#f5f8ff' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div>
                        <Text strong style={{ color: '#2e3856', display: 'block' }}>{deck.name}</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>{deck.totalCards} thẻ</Text>
                      </div>
                      <Checkbox checked={isChecked} onClick={(e) => e.stopPropagation()} onChange={(e) => {
                        if (e.target.checked) {
                          setTempSelectedDecks([...tempSelectedDecks, deck.id]);
                        } else {
                          setTempSelectedDecks(tempSelectedDecks.filter(id => id !== deck.id));
                        }
                      }} />
                    </div>
                  );
                })}
              </div>
            )}
          </Tabs.TabPane>
        </Tabs>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <Button
            type="primary"
            size="large"
            onClick={handleSaveDecksToFolder}
            style={{
              background: '#2563eb',
              borderColor: '#2563eb',
              borderRadius: '20px',
              fontWeight: 700,
              padding: '0 36px',
              height: '40px'
            }}
          >
            Xong
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default HomePage;
