import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useParams, history, useLocation, useModel } from 'umi';
import {
  Button,
  Card,
  Empty,
  Progress,
  Space,
  Switch,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  RetweetOutlined,
  StarFilled,
  StarOutlined,
} from '@ant-design/icons';
import { getDeckById, getStudySession, reviewCard, toggleReviewFlag, getAllDecks } from '../services';
import { Card as CardType, Deck } from '../services/typing';

const { Title, Text, Paragraph } = Typography;

function shuffleCards(cards: CardType[]): CardType[] {
  return [...cards].sort(() => Math.random() - 0.5);
}

const StudyPage: React.FC = () => {
  const { setUser } = useModel('useAuthModel');
  const { deckId } = useParams<{ deckId: string }>();
  const location = useLocation();

  const [deck, setDeck] = useState<Deck | null>(null);
  const [allDecks, setAllDecks] = useState<Deck[]>([]);
  const [availableCards, setAvailableCards] = useState<CardType[]>([]);
  const [reviewOnlyCards, setReviewOnlyCards] = useState<CardType[]>([]);

  const [shuffle, setShuffle] = useState<boolean>(false);
  const [reviewOnly, setReviewOnly] = useState<boolean>(false);

  const [sessionStarted, setSessionStarted] = useState<boolean>(false);
  const [sessionCards, setSessionCards] = useState<CardType[]>([]);
  const [initialCardsCount, setInitialCardsCount] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showBack, setShowBack] = useState<boolean>(false);
  const [masteredCount, setMasteredCount] = useState<number>(0);
  const [notMasteredCount, setNotMasteredCount] = useState<number>(0);
  const [finished, setFinished] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [reviewing, setReviewing] = useState<boolean>(false); // Prevent click spamming
  const reviewingRef = useRef<boolean>(false);

  const currentCard = sessionCards[currentIndex];

  const activeCardCount = reviewOnly
    ? reviewOnlyCards.length
    : availableCards.length;

  // Load study settings from localStorage
  const loadSavedSettings = useCallback(() => {
    if (!deckId) return;
    const saved = localStorage.getItem(`study_settings_${deckId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setShuffle(!!parsed.shuffle);
        setReviewOnly(!!parsed.reviewOnly);
        return parsed;
      } catch (e) {
        // Ignored
      }
    }
    return null;
  }, [deckId]);

  // Find next deck to recommend
  const nextDeck = useMemo(() => {
    if (allDecks.length <= 1 || !deck) return null;
    const otherDecks = allDecks.filter((d) => d.id !== deckId);
    
    // 1. Try to find a deck with a common tag
    const commonTagDeck = otherDecks.find((d) =>
      d.tags.some((t) => deck.tags.includes(t))
    );
    if (commonTagDeck) return commonTagDeck;
    
    // 2. Fallback to a random other deck
    return otherDecks[Math.floor(Math.random() * otherDecks.length)] || null;
  }, [allDecks, deck, deckId]);

  const loadInitialData = useCallback(async () => {
    if (!deckId) return;
    try {
      setLoading(true);
      const [deckData, normalCards, flaggedCards, decksList] = await Promise.all([
        getDeckById(deckId),
        getStudySession(deckId),
        getStudySession(deckId, { reviewOnly: true }),
        getAllDecks(),
      ]);

      setDeck(deckData);
      setAvailableCards(Array.isArray(normalCards) ? normalCards : []);
      setReviewOnlyCards(Array.isArray(flaggedCards) ? flaggedCards : []);
      setAllDecks(Array.isArray(decksList) ? decksList : []);

      // Auto start session if requested in URL
      const searchParams = new URLSearchParams(location.search);
      const shouldAutoStart = searchParams.get('autoStart') === 'true';

      const savedSettings = loadSavedSettings();
      const currentShuffle = savedSettings ? !!savedSettings.shuffle : false;
      const currentReviewOnly = savedSettings ? !!savedSettings.reviewOnly : false;

      if (shouldAutoStart) {
        let cardsToLoad = await getStudySession(deckId, {
          reviewOnly: currentReviewOnly && flaggedCards.length > 0 ? true : false,
        });

        if (Array.isArray(cardsToLoad) && cardsToLoad.length > 0) {
          if (currentShuffle) {
            cardsToLoad = shuffleCards(cardsToLoad);
          }
          setSessionCards(cardsToLoad);
          setInitialCardsCount(cardsToLoad.length);
          setCurrentIndex(0);
          setShowBack(false);
          setMasteredCount(0);
          setNotMasteredCount(0);
          setFinished(false);
          setSessionStarted(true);
        }
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không tải được dữ liệu học');
    } finally {
      setLoading(false);
    }
  }, [deckId, location.search, loadSavedSettings]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const refreshCardCounts = async () => {
    if (!deckId) return;
    try {
      const [normalCards, flaggedCards] = await Promise.all([
        getStudySession(deckId),
        getStudySession(deckId, { reviewOnly: true }),
      ]);

      setAvailableCards(Array.isArray(normalCards) ? normalCards : []);
      setReviewOnlyCards(Array.isArray(flaggedCards) ? flaggedCards : []);
    } catch {
      // Ignored
    }
  };

  const progressPercent = useMemo(() => {
    if (initialCardsCount === 0) return 0;
    return Math.min(100, Math.round((masteredCount / initialCardsCount) * 100));
  }, [masteredCount, initialCardsCount]);

  const handleStartSession = async () => {
    if (!deckId) return;
    try {
      setLoading(true);
      let cards = await getStudySession(deckId, {
        reviewOnly,
      });

      if (!Array.isArray(cards) || cards.length === 0) {
        if (reviewOnly) {
          message.warning('Bộ thẻ này chưa có thẻ nào được gắn cờ cần xem lại');
        } else {
          message.warning('Bộ thẻ này chưa có thẻ để học');
        }
        return;
      }

      if (shuffle) {
        cards = shuffleCards(cards);
      }

      setSessionCards(cards);
      setInitialCardsCount(cards.length);
      setCurrentIndex(0);
      setShowBack(false);
      setMasteredCount(0);
      setNotMasteredCount(0);
      setFinished(false);
      setSessionStarted(true);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không tạo được phiên học');
    } finally {
      setLoading(false);
    }
  };

  const finishIfNeeded = (nextIndex: number, nextSessionCards: CardType[]) => {
    if (nextIndex >= nextSessionCards.length) {
      setFinished(true);
      refreshCardCounts();
      return;
    }

    setCurrentIndex(nextIndex);
    setShowBack(false);
  };

  const handleReview = async (result: 'mastered' | 'not_mastered') => {
    if (reviewingRef.current) return; // Prevent double-clicks
    reviewingRef.current = true;
    setReviewing(true);
    
    try {
      const reviewedCard = sessionCards[currentIndex];
      if (!reviewedCard) {
        reviewingRef.current = false;
        setReviewing(false);
        return;
      }

      const res = await reviewCard(reviewedCard.id, result);
      // Update React auth state so Header XP/streak refreshes immediately
      if (res.user) {
        setUser(res.user);
      }

      if (result === 'mastered') {
        setMasteredCount((prev) => prev + 1);
        const nextIndex = currentIndex + 1;
        finishIfNeeded(nextIndex, sessionCards);
      } else {
        setNotMasteredCount((prev) => prev + 1);

        const repeatedCard: CardType = {
          ...reviewedCard,
          status: 'not_mastered',
        };

        const nextSessionCards = [...sessionCards, repeatedCard];
        setSessionCards(nextSessionCards);

        const nextIndex = currentIndex + 1;
        finishIfNeeded(nextIndex, nextSessionCards);
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không lưu được kết quả học');
    } finally {
      reviewingRef.current = false;
      setReviewing(false);
    }
  };

  const handleToggleCurrentCardReviewFlag = async () => {
    try {
      if (!currentCard) return;

      const updatedCard = await toggleReviewFlag(currentCard.id);

      setSessionCards((prevCards) =>
        prevCards.map((card) =>
          card.id === updatedCard.id ? updatedCard : card
        )
      );

      setAvailableCards((prevCards) =>
        prevCards.map((card) =>
          card.id === updatedCard.id ? updatedCard : card
        )
      );

      setReviewOnlyCards((prevCards) => {
        if (updatedCard.reviewFlag) {
          const exists = prevCards.some((card) => card.id === updatedCard.id);
          if (exists) {
            return prevCards.map((card) =>
              card.id === updatedCard.id ? updatedCard : card
            );
          }
          return [...prevCards, updatedCard];
        }
        return prevCards.filter((card) => card.id !== updatedCard.id);
      });

      message.success(
        updatedCard.reviewFlag
          ? 'Đã gắn cờ cần xem lại'
          : 'Đã bỏ cờ cần xem lại'
      );
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không cập nhật được cờ xem lại');
    }
  };

  // Keyboard shortcuts listener for study session
  useEffect(() => {
    if (!sessionStarted || finished) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleReview('not_mastered');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleReview('mastered');
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        setShowBack((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [sessionStarted, finished, handleReview, setShowBack]);

  const handleChangeReviewOnly = (checked: boolean) => {
    setReviewOnly(checked);
    setCurrentIndex(0);
    setShowBack(false);
    
    // Persist study settings
    localStorage.setItem(
      `study_settings_${deckId}`,
      JSON.stringify({ shuffle, reviewOnly: checked })
    );
  };

  const handleShuffleChange = (checked: boolean) => {
    setShuffle(checked);
    // Persist study settings
    localStorage.setItem(
      `study_settings_${deckId}`,
      JSON.stringify({ shuffle: checked, reviewOnly })
    );
  };

  if (loading && !sessionStarted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', width: '100%', background: '#ffffff' }}>
        <div className="dino-animation" style={{ fontSize: '64px', marginBottom: '16px' }}>🦕</div>
        <div className="splash-spinner-container">
          <div className="splash-spinner"></div>
        </div>
        <div className="splash-text">Đang chuẩn bị học phần...</div>
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

  // Setup / Settings onboarding screen (only shown if not auto-started)
  if (!sessionStarted) {
    return (
      <>
        <div className="page-header">
          <div>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => history.push(`/decks/${deckId}`)}
              style={{ marginBottom: 12 }}
            >
              Quay lại bộ thẻ
            </Button>

            <Title level={2}>Học: {deck?.name}</Title>

            <Text type="secondary">
              Mỗi phiên học tối đa 10 thẻ. Thẻ chưa thuộc sẽ quay lại cuối phiên.
            </Text>
          </div>
        </div>

        <Card style={{ borderRadius: 16 }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Title level={4}>Thông tin phiên học</Title>

              <Paragraph>
                Bộ thẻ hiện có <b>{availableCards.length}</b> thẻ sẵn sàng học.
              </Paragraph>

              <Paragraph>
                Có <b>{reviewOnlyCards.length}</b> thẻ đang được gắn cờ{' '}
                <Tag color="gold" icon={<StarFilled />}>
                  Cần xem lại
                </Tag>
              </Paragraph>

              <Space size="large" wrap style={{ marginTop: 8 }}>
                <Space>
                  <Text>Xáo trộn thẻ ngẫu nhiên</Text>
                  <Switch
                    checked={shuffle}
                    onChange={handleShuffleChange}
                  />
                </Space>

                <Space>
                  <Text>Chỉ ôn thẻ cần xem lại</Text>
                  <Switch
                    checked={reviewOnly}
                    onChange={handleChangeReviewOnly}
                    disabled={reviewOnlyCards.length === 0}
                  />
                </Space>
              </Space>
            </div>

            {reviewOnly && reviewOnlyCards.length === 0 ? (
              <Empty description="Chưa có thẻ nào được gắn cờ cần xem lại" />
            ) : null}

            <Button
              type="primary"
              size="large"
              icon={<RetweetOutlined />}
              onClick={handleStartSession}
              disabled={activeCardCount === 0}
              loading={loading}
            >
              {reviewOnly ? 'Bắt đầu học thẻ cần xem lại' : 'Bắt đầu học'}
            </Button>
          </Space>
        </Card>
      </>
    );
  }

  // Session completed/finished screen
  if (finished) {
    // Standard XP is +10 for mastered, +2 for not_mastered, but with our new weighted XP it might differ,
    // so we display the actual logs XP sum or calculate it.
    const totalXpGained = masteredCount * 10 + notMasteredCount * 2; // (Or display sum, but this is a good summary)
    
    return (
      <div style={{ padding: '24px 0' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => history.push(`/decks/${deckId}`)}
          style={{ marginBottom: 16 }}
        >
          Quay lại bộ thẻ
        </Button>

        <Card style={{ borderRadius: 18, border: '1px solid #e8ecea', maxWidth: '600px', margin: '0 auto', boxShadow: '0 6px 20px rgba(0,0,0,0.04)' }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <span style={{ fontSize: '48px' }}>🎉</span>
              <Title level={2} style={{ marginTop: '12px' }}>Hoàn thành phiên học!</Title>
              <Text type="secondary">Bạn đã hoàn thành xuất sắc vòng ôn luyện này.</Text>
            </div>

            <div style={{ background: '#f6f7fb', padding: '20px', borderRadius: '14px', border: '1px solid #edeff4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text type="secondary">Chế độ học:</Text>
                <Text strong>{reviewOnly ? 'Chỉ ôn thẻ xem lại' : 'Tất cả thẻ'}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text type="secondary">Số thẻ đã thuộc:</Text>
                <Text strong style={{ color: '#52c41a' }}>{masteredCount} thẻ</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text type="secondary">Lượt trả lời chưa thuộc:</Text>
                <Text strong style={{ color: '#ff4d4f' }}>{notMasteredCount} lượt</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e8e8e8', paddingTop: '10px', marginTop: '10px' }}>
                <Text type="secondary" style={{ fontWeight: 600 }}>XP nhận được:</Text>
                <Text strong style={{ color: '#faad14', fontSize: '16px' }}>+{totalXpGained} XP</Text>
              </div>
            </div>

            <div className="study-complete-actions" style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <Button
                style={{ flex: 1, height: '48px', borderRadius: '24px', fontWeight: 600 }}
                onClick={handleStartSession}
              >
                Học lại
              </Button>

              {nextDeck ? (
                <Button
                  type="primary"
                  style={{ flex: 2, height: '48px', borderRadius: '24px', fontWeight: 600 }}
                  onClick={() => {
                    history.push(`/decks/${nextDeck.id}/study?autoStart=true`);
                  }}
                >
                  Kế tiếp: {nextDeck.name} ➔
                </Button>
              ) : (
                <Button
                  type="primary"
                  style={{ flex: 2, height: '48px', borderRadius: '24px', fontWeight: 600 }}
                  onClick={() => history.push('/')}
                >
                  Quay về trang chủ
                </Button>
              )}
            </div>
          </Space>
        </Card>
      </div>
    );
  }

  // Standard study session screen
  return (
    <>
      <div className="page-header">
        <div style={{ width: '100%' }}>
          <Title level={2} style={{ marginBottom: 4 }}>Học: {deck?.name}</Title>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: 4 }}>
            <Text type="secondary" style={{ fontSize: '14px', fontWeight: 500 }}>
              Thẻ {currentIndex + 1}/{sessionCards.length}
            </Text>
            <span style={{ color: '#d9d9d9' }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1, maxWidth: '280px' }}>
              <Text style={{ fontWeight: 600, color: '#52c41a', fontSize: '14px', whiteSpace: 'nowrap' }}>
                Đã thuộc {masteredCount}/{initialCardsCount}
              </Text>
              <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                <Progress
                  percent={progressPercent}
                  strokeColor="#52c41a"
                  showInfo={false}
                  strokeWidth={8}
                  style={{ margin: 0, width: '100%' }}
                />
              </div>
            </div>
          </div>

          {reviewOnly && (
            <div style={{ marginTop: 8 }}>
              <Tag color="gold" icon={<StarFilled />}>
                Đang học thẻ cần xem lại
              </Tag>
            </div>
          )}
        </div>
      </div>

      <div className="study-wrapper">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>

          {/* Action row with side buttons for speed study */}
          <div className="study-layout-row" style={{ display: 'flex', alignItems: 'center', gap: '24px', width: '100%', position: 'relative' }}>
            
            {/* Left Button: Not Mastered */}
            <div className="study-btn-desktop">
              <Tooltip title="Chưa thuộc (Phím mũi tên trái)">
                <Button
                  danger
                  type="primary"
                  shape="circle"
                  icon={<CloseCircleOutlined style={{ fontSize: '24px' }} />}
                  onClick={() => handleReview('not_mastered')}
                  disabled={reviewing}
                  style={{
                    width: '64px',
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(255, 77, 79, 0.25)',
                    flexShrink: 0
                  }}
                />
              </Tooltip>
            </div>

            {/* Center: Progress & Flashcard */}
            <div className="study-card-container">
              {/* Flashcard */}
              <Card
                className="flashcard"
                onClick={() => setShowBack((prev) => !prev)}
                style={{
                  flexGrow: 1,
                  borderRadius: 24,
                  cursor: 'pointer',
                  minHeight: 280,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.03)',
                  border: '1px solid #e8ecea'
                }}
              >
                {/* Star corner button */}
                <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
                  <Button
                    type="text"
                    icon={currentCard?.reviewFlag ? <StarFilled style={{ color: '#faad14', fontSize: '24px' }} /> : <StarOutlined style={{ color: '#939bb4', fontSize: '24px' }} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleCurrentCardReviewFlag();
                    }}
                    style={{ padding: 0 }}
                  />
                </div>

                <div style={{ width: '100%', textAlign: 'center' }}>
                  <Tag color={showBack ? 'green' : 'blue'} style={{ borderRadius: '6px', fontWeight: 600 }}>
                    {showBack ? 'Mặt sau' : 'Mặt trước'}
                  </Tag>

                  <div className="flashcard-content" style={{ marginTop: 24, fontSize: '22px', fontWeight: 600, color: '#2e3856', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <div dangerouslySetInnerHTML={{ __html: showBack ? currentCard?.back : currentCard?.front }} />
                    {showBack && currentCard?.imageUrl && (
                      <img
                        src={currentCard.imageUrl}
                        alt="Hình ảnh minh họa"
                        style={{
                          maxWidth: '240px',
                          maxHeight: '180px',
                          objectFit: 'contain',
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                          border: '1px solid #edf0ee',
                          marginTop: '8px'
                        }}
                      />
                    )}
                  </div>

                  <Text
                    type="secondary"
                    style={{ display: 'block', marginTop: 24, fontSize: '13px' }}
                  >
                    Bấm vào thẻ để lật
                  </Text>
                </div>
              </Card>
            </div>

            {/* Right Button: Mastered */}
            <div className="study-btn-desktop">
              <Tooltip title="Đã thuộc (Phím mũi tên phải)">
                <Button
                  type="primary"
                  shape="circle"
                  icon={<CheckCircleOutlined style={{ fontSize: '24px' }} />}
                  onClick={() => handleReview('mastered')}
                  disabled={reviewing}
                  style={{
                    width: '64px',
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#52c41a',
                    borderColor: '#52c41a',
                    boxShadow: '0 4px 12px rgba(82, 196, 26, 0.25)',
                    flexShrink: 0
                  }}
                />
              </Tooltip>
            </div>
          </div>
        </Space>
      </div>

      {/* Mobile-specific styles for study page */}
      <style>{`
        .study-btn-desktop {
          display: block;
        }
        .study-card-container {
          display: flex;
          width: 100%;
          align-items: stretch;
          flex-grow: 1;
        }

        @media (max-width: 768px) {
          .study-wrapper {
            padding: 0 12px 100px 12px !important;
          }
          .study-btn-desktop {
            display: none !important;
          }
          .flashcard {
            min-height: 280px !important;
            max-height: calc(100vh - 280px) !important;
            overflow-y: auto !important;
            padding: 20px !important;
          }
          .study-layout-row {
            gap: 0 !important;
          }
          .study-mobile-actions {
            display: flex !important;
            position: fixed !important;
            bottom: 0;
            left: 0;
            right: 0;
            background: #ffffff;
            box-shadow: 0 -4px 12px rgba(0,0,0,0.06);
            padding: 16px 20px;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            z-index: 1000;
          }
          /* Adjust Title header on mobile */
          .page-header {
            padding: 12px 16px !important;
            margin-bottom: 12px !important;
          }
          .page-header h2 {
            font-size: 20px !important;
            margin-bottom: 4px !important;
          }
        }
      `}</style>

      {/* Mobile fixed bottom bar container */}
      <div
        className="study-mobile-actions"
        style={{
          display: 'none',
        }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => history.push(`/decks/${deckId}`)}
          style={{ height: '48px', width: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        />
        
        <div style={{ flex: 1, display: 'flex', gap: '12px' }}>
          <Button
            danger
            type="primary"
            onClick={() => handleReview('not_mastered')}
            disabled={reviewing}
            style={{ flex: 1, height: '48px', borderRadius: '12px', fontWeight: 600 }}
          >
            Chưa thuộc
          </Button>
          
          <Button
            type="primary"
            onClick={() => handleReview('mastered')}
            disabled={reviewing}
            style={{ flex: 1, height: '48px', borderRadius: '12px', fontWeight: 600, background: '#52c41a', borderColor: '#52c41a' }}
          >
            Đã thuộc
          </Button>
        </div>
      </div>
    </>
  );
};

export default StudyPage;
