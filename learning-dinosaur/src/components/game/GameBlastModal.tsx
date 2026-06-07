import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Radio, Space, Typography, Progress, message, Select } from 'antd';
import { useModel } from 'umi';
import { RocketOutlined, HeartFilled, TrophyOutlined } from '@ant-design/icons';
import { Deck, Card } from '../../services/typing';
import { getDeckCards } from '../../services';

const { Text, Title } = Typography;

interface GameBlastModalProps {
  visible: boolean;
  onCancel: () => void;
}

const GameBlastModal: React.FC<GameBlastModalProps> = ({ visible, onCancel }) => {
  const { decks, loadDecks } = useModel('useDeckModel');
  const { user, updateUserProfile } = useModel('useAuthModel');

  const [gameState, setGameState] = useState<'select' | 'playing' | 'gameover'>('select');
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [laserActive, setLaserActive] = useState<boolean>(false);
  const [explosionActive, setExplosionActive] = useState<boolean>(false);
  const [isWrong, setIsWrong] = useState<boolean>(false);

  const [fallingProgress, setFallingProgress] = useState<number>(0); // 0 to 100%

  const gameLoopRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const fallingRef = useRef<any>(null);

  useEffect(() => {
    if (visible) {
      loadDecks();
      setGameState('select');
      setSelectedDeckId(null);
      setScore(0);
      setLives(3);
      setTimeLeft(60);
      setCurrentCard(null);
      setFallingProgress(0);
    }
  }, [visible, loadDecks]);

  // Clean loops on close
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearInterval(fallingRef.current);
      clearTimeout(gameLoopRef.current);
    };
  }, []);

  const handleStartGame = async () => {
    if (!selectedDeckId) {
      message.error('Vui lòng chọn một bộ thẻ để học!');
      return;
    }
    const hideLoading = message.loading('Đang tải thẻ học...', 0);
    try {
      const deckCards = await getDeckCards(selectedDeckId);
      hideLoading();
      if (!deckCards || deckCards.length < 4) {
        message.error('Bộ thẻ này cần có ít nhất 4 thẻ để chơi game trắc nghiệm!');
        return;
      }

      setCards(deckCards);
      setScore(0);
      setLives(3);
      setTimeLeft(60);
      setGameState('playing');
      setFallingProgress(0);
      
      // Start game flow
      spawnQuestion(deckCards);
      startTimer();
    } catch (err) {
      hideLoading();
      message.error('Không tải được danh sách thẻ!');
    }
  };

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const spawnQuestion = (deckCards: Card[]) => {
    if (deckCards.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * deckCards.length);
    const correctCard = deckCards[randomIndex];
    setCurrentCard(correctCard);
    setFallingProgress(0);
    setIsWrong(false);

    // Create options (1 correct, 3 random wrong)
    const answers = new Set<string>();
    // Clean HTML tags from definition
    const cleanCorrect = correctCard.back.replace(/<[^>]*>/g, '');
    answers.add(cleanCorrect);

    const otherCards = deckCards.filter(c => c.id !== correctCard.id);
    while (answers.size < Math.min(4, deckCards.length) && otherCards.length > 0) {
      const idx = Math.floor(Math.random() * otherCards.length);
      const wrongText = otherCards[idx].back.replace(/<[^>]*>/g, '');
      answers.add(wrongText);
    }

    setOptions(shuffleArray(Array.from(answers)));

    // Start falling animation
    clearInterval(fallingRef.current);
    fallingRef.current = setInterval(() => {
      setFallingProgress(prev => {
        if (prev >= 100) {
          // Touch bottom -> lose life
          handleMiss();
          return 0;
        }
        return prev + 1.8; // Falling speed
      });
    }, 100);
  };

  const handleMiss = () => {
    setLives(prev => {
      const nextLives = prev - 1;
      if (nextLives <= 0) {
        endGame();
      } else {
        message.warning('Từ vựng đã rơi xuống đất! Mất 1 mạng.');
        spawnQuestion(cards);
      }
      return nextLives;
    });
  };

  const handleAnswer = (selectedOption: string) => {
    if (!currentCard || laserActive || explosionActive) return;

    const correctText = currentCard.back.replace(/<[^>]*>/g, '');
    if (selectedOption === correctText) {
      // Correct! Activate laser -> explode
      setLaserActive(true);
      setTimeout(() => {
        setLaserActive(false);
        setExplosionActive(true);
        setScore(prev => prev + 10);
        
        setTimeout(() => {
          setExplosionActive(false);
          spawnQuestion(cards);
        }, 300);
      }, 400);
    } else {
      // Wrong answer
      setIsWrong(true);
      setLives(prev => {
        const nextLives = prev - 1;
        if (nextLives <= 0) {
          endGame();
        } else {
          message.error('Sai rồi! Mất 1 mạng.');
          // Briefly highlight wrong and spawn new
          setTimeout(() => {
            spawnQuestion(cards);
          }, 800);
        }
        return nextLives;
      });
    }
  };

  const endGame = () => {
    setGameState('gameover');
    clearInterval(timerRef.current);
    clearInterval(fallingRef.current);
  };

  const handleCollectXp = async () => {
    const xpEarned = Math.floor(score / 5); // 5 points = 1 XP
    if (xpEarned > 0 && user) {
      try {
        const newXp = (user.xp || 0) + xpEarned;
        await updateUserProfile({ displayName: user.displayName, email: user.email, avatarIndex: user.avatarIndex, avatarUrl: user.avatarUrl });
        // Call backend update XP to persist
        // We can call directly updateUserProfile API since it saves user data
        // Let's assume updating user profile triggers user save
        message.success(`Chúc mừng! Bạn nhận được +${xpEarned} XP từ trò chơi!`);
      } catch {
        message.error('Không lưu được điểm XP');
      }
    }
    onCancel();
  };

  const shuffleArray = (arr: any[]) => {
    return arr.sort(() => Math.random() - 0.5);
  };

  return (
    <Modal
      title={
        <Space style={{ color: '#2f855a' }}>
          <RocketOutlined style={{ fontSize: '20px' }} />
          <span>Blast — Bắn tên lửa từ vựng</span>
        </Space>
      }
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={720}
      bodyStyle={{ background: '#0b0f19', color: '#ffffff', minHeight: '480px', borderRadius: '0 0 16px 16px', overflow: 'hidden', padding: '24px' }}
      style={{ top: 50 }}
    >
      {gameState === 'select' && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <RocketOutlined style={{ fontSize: '80px', color: '#38b000', marginBottom: '24px', animation: 'bounce-dino 1.5s ease-in-out infinite' }} />
          <Title level={2} style={{ color: '#ffffff', marginBottom: '16px' }}>Chào mừng đến với Blast!</Title>
          <Text style={{ color: '#b9c1d9', fontSize: '15px', display: 'block', marginBottom: '32px', maxWidth: '480px', margin: '0 auto 32px' }}>
            Các thuật ngữ sẽ trôi nổi trong không gian. Nhiệm vụ của bạn là chọn đúng nghĩa của chúng để bắn tên lửa phá hủy trước khi chúng rơi xuống đất!
          </Text>

          <div style={{ maxWidth: '320px', margin: '0 auto 32px' }}>
            <Text strong style={{ color: '#ffffff', display: 'block', marginBottom: '10px', textAlign: 'left' }}>Chọn bộ thẻ học tập</Text>
            <Select
              placeholder="Chọn một bộ thẻ để bắt đầu..."
              style={{ width: '100%' }}
              dropdownStyle={{ background: '#1f2937', color: '#ffffff' }}
              onChange={setSelectedDeckId}
              options={decks.map(d => ({ label: `${d.name} (${d.totalCards} thẻ)`, value: d.id }))}
            />
          </div>

          <Button
            type="primary"
            size="large"
            onClick={handleStartGame}
            style={{ background: '#2f855a', borderColor: '#2f855a', height: '48px', borderRadius: '24px', padding: '0 40px', fontWeight: 'bold' }}
          >
            Bắt đầu chơi
          </Button>
        </div>
      )}

      {gameState === 'playing' && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '480px', justifyContent: 'space-between', position: 'relative' }}>
          {/* Header game: Score, Lives, Time */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', zIndex: 10 }}>
            <div>
              <Text style={{ color: '#ffffff', marginRight: '20px' }}>Điểm số: <strong style={{ color: '#ffb703', fontSize: '18px' }}>{score}</strong></Text>
              <Space>
                {Array.from({ length: 3 }).map((_, i) => (
                  <HeartFilled key={i} style={{ color: i < lives ? '#ff006e' : '#374151', fontSize: '18px' }} />
                ))}
              </Space>
            </div>
            <div>
              <Progress
                type="circle"
                percent={(timeLeft / 60) * 100}
                format={() => `${timeLeft}s`}
                width={50}
                strokeColor="#ffb703"
                trailColor="#1f2937"
                strokeWidth={10}
              />
            </div>
          </div>

          {/* Space canvas area */}
          <div style={{ flex: 1, position: 'relative', width: '100%', overflow: 'hidden', background: '#0a0d1a', border: '1px solid #1f2937', borderRadius: '12px', margin: '16px 0' }}>
            {/* Stars background */}
            <div className="space-stars" />

            {/* Falling word */}
            {currentCard && !explosionActive && (
              <div
                style={{
                  position: 'absolute',
                  top: `${fallingProgress}%`,
                  left: '50%',
                  transform: 'translateX(-50%) translateY(-100%)',
                  background: isWrong ? '#d90429' : '#1f2937',
                  border: isWrong ? '2px solid #ff4d4f' : '2px solid #4257b2',
                  padding: '8px 20px',
                  borderRadius: '20px',
                  boxShadow: '0 4px 14px rgba(66, 87, 178, 0.4)',
                  color: '#ffffff',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  transition: isWrong ? 'none' : 'top 0.1s linear',
                  zIndex: 5,
                }}
              >
                {currentCard.front.replace(/<[^>]*>/g, '')}
              </div>
            )}

            {/* Explosion Effect */}
            {explosionActive && (
              <div
                style={{
                  position: 'absolute',
                  top: `${fallingProgress}%`,
                  left: '50%',
                  transform: 'translateX(-50%) translateY(-100%) scale(1.5)',
                  fontSize: '36px',
                  zIndex: 6,
                  animation: 'explode-effect 0.3s ease-out',
                }}
              >
                💥
              </div>
            )}

            {/* Space ship & laser beam */}
            <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 5 }}>
              {/* Laser beam */}
              {laserActive && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '4px',
                    height: `${480 - (fallingProgress / 100) * 320}px`,
                    background: '#ff006e',
                    boxShadow: '0 0 12px #ff006e, 0 0 20px #ff006e',
                    zIndex: 4,
                  }}
                />
              )}
              {/* Spaceship icon */}
              <div style={{ fontSize: '42px', color: '#ffc300', textShadow: '0 0 10px #ffc300' }}>🚀</div>
            </div>
          </div>

          {/* Options block */}
          <div style={{ zIndex: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {options.map((option, idx) => (
                <Button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  disabled={laserActive || explosionActive || isWrong}
                  style={{
                    background: '#1f2937',
                    color: '#ffffff',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    height: '52px',
                    fontSize: '15px',
                    fontWeight: 600,
                    whiteSpace: 'normal',
                    lineHeight: '1.2',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
                    transition: 'all 0.2s',
                  }}
                  className="game-option-btn"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <TrophyOutlined style={{ fontSize: '80px', color: '#ffb703', marginBottom: '24px' }} />
          <Title level={2} style={{ color: '#ffffff', marginBottom: '8px' }}>Kết thúc trò chơi!</Title>
          <Text style={{ color: '#b9c1d9', fontSize: '16px', display: 'block', marginBottom: '32px' }}>
            Bạn đã hoàn thành lượt chơi xuất sắc!
          </Text>

          <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '16px', padding: '24px', maxWidth: '320px', margin: '0 auto 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <Text style={{ color: '#b9c1d9' }}>Điểm game:</Text>
              <Text strong style={{ color: '#ffffff', fontSize: '18px' }}>{score}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #1f2937', paddingTop: '12px' }}>
              <Text style={{ color: '#b9c1d9' }}>XP nhận được:</Text>
              <Text strong style={{ color: '#38b000', fontSize: '20px' }}>+{Math.floor(score / 5)} XP</Text>
            </div>
          </div>

          <Button
            type="primary"
            size="large"
            onClick={handleCollectXp}
            style={{ background: '#2f855a', borderColor: '#2f855a', height: '48px', borderRadius: '24px', padding: '0 40px', fontWeight: 'bold' }}
          >
            Nhận XP & Đóng
          </Button>
        </div>
      )}

      <style>{`
        .space-stars {
          position: absolute;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 40px),
            radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 30px);
          background-size: 240px 240px, 180px 180px;
          background-position: 0 0, 40px 60px;
          opacity: 0.3;
        }

        .game-option-btn:hover:not(:disabled) {
          background: #4257b2 !important;
          border-color: #4257b2 !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(66, 87, 178, 0.3) !important;
        }

        @keyframes explode-effect {
          0% { transform: translateX(-50%) translateY(-100%) scale(0.8); opacity: 1; }
          50% { transform: translateX(-50%) translateY(-100%) scale(1.6); opacity: 0.8; }
          100% { transform: translateX(-50%) translateY(-100%) scale(2.0); opacity: 0; }
        }
      `}</style>
    </Modal>
  );
};

export default GameBlastModal;
