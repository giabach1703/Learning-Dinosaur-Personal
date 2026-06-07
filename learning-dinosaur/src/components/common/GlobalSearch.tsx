import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Modal, Input, List, Tag, Typography, Button, Tooltip, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { history } from 'umi';
import { globalSearch } from '../../services';
import { Card, Deck } from '../../services/typing';

const { Text, Title } = Typography;

const GlobalSearch: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const [keyword, setKeyword] = useState<string>('');
  const [results, setResults] = useState<{
    decks: Deck[];
    cards: (Card & { deckName?: string })[];
  }>({
    decks: [],
    cards: [],
  });

  const inputRef = useRef<any>(null);

  // Trigger search on keyword change
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      const searchText = keyword.trim();

      if (!searchText) {
        setResults({ decks: [], cards: [] });
        return;
      }

      try {
        const data = await globalSearch(searchText);
        setResults({
          decks: Array.isArray(data.decks) ? data.decks : [],
          cards: Array.isArray(data.cards) ? data.cards : [],
        });
      } catch {
        setResults({ decks: [], cards: [] });
      }
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [keyword]);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setVisible(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    } else {
      setKeyword('');
      setResults({ decks: [], cards: [] });
    }
  }, [visible]);

  const handleSelect = (type: 'deck' | 'card', id: string, deckId?: string) => {
    setVisible(false);
    if (type === 'deck') {
      history.push(`/decks/${id}`);
    } else if (type === 'card' && deckId) {
      history.push(`/decks/${deckId}`);
    }
  };

  const hasResults = results.decks.length > 0 || results.cards.length > 0;

  return (
    <>
      <Tooltip title="Tìm kiếm (Ctrl+K)">
        <Button
          type="text"
          icon={<SearchOutlined style={{ fontSize: '20px', color: '#2e3856' }} />}
          onClick={() => setVisible(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#f6f7fb',
            border: 'none',
          }}
        />
      </Tooltip>

      <Modal
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        closable={false}
        width={550}
        bodyStyle={{ padding: '20px', borderRadius: '16px' }}
        style={{ top: 80 }}
      >
        <Input
          ref={inputRef}
          prefix={<SearchOutlined style={{ color: '#939bb4', fontSize: '18px', marginRight: '6px' }} />}
          placeholder="Tìm kiếm bộ thẻ hoặc từ vựng..."
          size="large"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          allowClear
          style={{
            height: '50px',
            borderRadius: '12px',
            fontSize: '16px',
            border: '2px solid #edeff4',
            background: '#f6f7fb',
          }}
        />

        <div style={{ marginTop: '16px', maxHeight: '350px', overflowY: 'auto' }}>
          {keyword.trim() === '' ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: '#939bb4' }}>
              <Text type="secondary">Nhập từ khóa để tìm kiếm bộ thẻ hoặc thẻ nội dung...</Text>
            </div>
          ) : !hasResults ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: '#939bb4' }}>
              <Text type="secondary">Không tìm thấy kết quả nào phù hợp</Text>
            </div>
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={[
                ...results.decks.map(d => ({ ...d, searchType: 'deck' as const })),
                ...results.cards.map(c => ({ ...c, searchType: 'card' as const }))
              ]}
              renderItem={(item) => {
                if (item.searchType === 'deck') {
                  const deck = item as Deck;
                  return (
                    <List.Item
                      onClick={() => handleSelect('deck', deck.id)}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        borderRadius: '10px',
                        transition: 'background 0.2s',
                        border: 'none',
                        marginBottom: '4px'
                      }}
                      className="search-result-item"
                    >
                      <List.Item.Meta
                        title={
                          <Space>
                            <Tag color="green" style={{ borderRadius: '6px', fontWeight: 600 }}>Bộ thẻ</Tag>
                            <Text strong style={{ color: '#2e3856', fontSize: '15px' }}>{deck.name}</Text>
                          </Space>
                        }
                        description={
                          <Text type="secondary" style={{ fontSize: '13px' }}>
                            {deck.description || 'Không có mô tả'} · {deck.totalCards} thẻ
                          </Text>
                        }
                      />
                    </List.Item>
                  );
                } else {
                  const card = item as Card & { deckName?: string };
                  const cleanFront = card.front.replace(/<[^>]*>/g, '');
                  const cleanBack = card.back.replace(/<[^>]*>/g, '');
                  return (
                    <List.Item
                      onClick={() => handleSelect('card', card.id, card.deckId)}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        borderRadius: '10px',
                        transition: 'background 0.2s',
                        border: 'none',
                        marginBottom: '4px'
                      }}
                      className="search-result-item"
                    >
                      <List.Item.Meta
                        title={
                          <Space>
                            <Tag color="blue" style={{ borderRadius: '6px', fontWeight: 600 }}>Thẻ</Tag>
                            <Text strong style={{ color: '#2e3856', fontSize: '15px' }}>{cleanFront}</Text>
                          </Space>
                        }
                        description={
                          <Text type="secondary" style={{ fontSize: '13px' }}>
                            Định nghĩa: {cleanBack} · Trong deck: {card.deckName || 'N/A'}
                          </Text>
                        }
                      />
                    </List.Item>
                  );
                }
              }}
            />
          )}
        </div>
      </Modal>

      <style>{`
        .search-result-item:hover {
          background-color: #f6f7fb;
        }
      `}</style>
    </>
  );
};

export default GlobalSearch;
