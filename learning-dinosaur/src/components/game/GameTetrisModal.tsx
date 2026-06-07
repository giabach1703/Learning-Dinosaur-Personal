import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, Button, Space, Typography, Progress, message, Select } from 'antd';
import { useModel } from 'umi';
import { BorderOuterOutlined, TrophyOutlined } from '@ant-design/icons';
import { Card } from '../../services/typing';
import { getDeckCards } from '../../services';

const { Text, Title } = Typography;

interface GameTetrisModalProps {
  visible: boolean;
  onCancel: () => void;
}

// Tetris Constants
const COLS = 10;
const ROWS = 16;

const SHAPES = [
  [[1, 1, 1, 1]],       // I
  [[1, 1, 1], [0, 1, 0]], // T
  [[1, 1, 1], [1, 0, 0]], // L
  [[1, 1, 1], [0, 0, 1]], // J
  [[1, 1], [1, 1]],       // O
  [[1, 1, 0], [0, 1, 1]], // Z
  [[0, 1, 1], [1, 1, 0]], // S
];

const COLORS = [
  'transparent',
  '#00f0f0', // I - cyan
  '#a000f0', // T - purple
  '#f0a000', // L - orange
  '#0000f0', // J - blue
  '#f0f000', // O - yellow
  '#f00000', // Z - red
  '#00f000', // S - green
];

type GamePhase = 'select' | 'question' | 'falling' | 'gameover';

interface PieceState {
  shape: number[][];
  colorIndex: number;
  x: number;
  y: number;
}

const emptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0));

const GameTetrisModal: React.FC<GameTetrisModalProps> = ({ visible, onCancel }) => {
  const { decks, loadDecks } = useModel('useDeckModel');
  const { user, updateUserProfile } = useModel('useAuthModel');

  // ---- Render state (triggers UI re-render) ----
  const [gamePhase, setGamePhase] = useState<GamePhase>('select');
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [linesCleared, setLinesCleared] = useState(0);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [controlEnabled, setControlEnabled] = useState(true);

  // Render-only board snapshot (merged grid + falling piece)
  const [renderGrid, setRenderGrid] = useState<number[][]>(emptyGrid());

  // ---- Refs (no stale closure, always fresh) ----
  const gridRef = useRef<number[][]>(emptyGrid());
  const pieceRef = useRef<PieceState | null>(null);
  const cardsRef = useRef<Card[]>([]);
  const controlRef = useRef(true);
  const gamePhaseRef = useRef<GamePhase>('select');
  const fallIntervalRef = useRef<any>(null);
  const isLandingRef = useRef(false); // guard to prevent double-landing

  // Keep gamePhaseRef in sync
  useEffect(() => {
    gamePhaseRef.current = gamePhase;
  }, [gamePhase]);

  // ---- Helper: compute display grid (grid + falling piece) ----
  const computeRenderGrid = useCallback((grid: number[][], piece: PieceState | null) => {
    const display = grid.map(row => [...row]);
    if (piece) {
      for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
          if (piece.shape[r][c] !== 0) {
            const gy = piece.y + r;
            const gx = piece.x + c;
            if (gy >= 0 && gy < ROWS && gx >= 0 && gx < COLS) {
              display[gy][gx] = piece.colorIndex;
            }
          }
        }
      }
    }
    return display;
  }, []);

  // ---- Collision check ----
  const checkCollision = useCallback((shape: number[][], offsetX: number, offsetY: number, grid: number[][]) => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const nx = offsetX + c;
          const ny = offsetY + r;
          if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
          if (ny >= 0 && grid[ny][nx] !== 0) return true;
        }
      }
    }
    return false;
  }, []);

  // ---- Rotate matrix ----
  const rotateMatrix = (matrix: number[][]) => {
    const n = matrix.length;
    const m = matrix[0].length;
    const rotated = Array.from({ length: m }, () => Array(n).fill(0));
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < m; c++) {
        rotated[c][n - 1 - r] = matrix[r][c];
      }
    }
    return rotated;
  };

  // ---- Clear full lines ----
  const clearLines = (grid: number[][]) => {
    let cleared = 0;
    const newGrid = grid.filter(row => {
      if (row.every(cell => cell !== 0)) { cleared++; return false; }
      return true;
    });
    while (newGrid.length < ROWS) newGrid.unshift(Array(COLS).fill(0));
    return { newGrid, cleared };
  };

  // ---- Spawn question ----
  const spawnQuestion = useCallback((deckCards: Card[]) => {
    if (deckCards.length === 0) return;
    const idx = Math.floor(Math.random() * deckCards.length);
    const correctCard = deckCards[idx];

    const answers = new Set<string>();
    const cleanCorrect = correctCard.back.replace(/<[^>]*>/g, '');
    answers.add(cleanCorrect);

    const others = deckCards.filter(c => c.id !== correctCard.id);
    const shuffledOthers = [...others].sort(() => Math.random() - 0.5);
    for (const o of shuffledOthers) {
      if (answers.size >= 4) break;
      answers.add(o.back.replace(/<[^>]*>/g, ''));
    }

    setCurrentCard(correctCard);
    setOptions([...answers].sort(() => Math.random() - 0.5));
    setGamePhase('question');
  }, []);

  // ---- Land piece: merge into grid, clear lines, spawn next question ----
  const landPiece = useCallback(() => {
    if (isLandingRef.current) return;
    isLandingRef.current = true;

    clearInterval(fallIntervalRef.current);
    const piece = pieceRef.current;
    if (!piece) { isLandingRef.current = false; return; }

    // Merge piece into grid
    const newGrid = gridRef.current.map(row => [...row]);
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c] !== 0) {
          const gy = piece.y + r;
          const gx = piece.x + c;
          if (gy >= 0 && gy < ROWS && gx >= 0 && gx < COLS) {
            newGrid[gy][gx] = piece.colorIndex;
          }
        }
      }
    }

    // Clear full lines
    const { newGrid: cleanGrid, cleared } = clearLines(newGrid);
    if (cleared > 0) {
      setLinesCleared(prev => prev + cleared);
      setScore(prev => prev + cleared * 100);
    }

    // Check game over: piece landed very high
    if (piece.y <= 1) {
      gridRef.current = cleanGrid;
      pieceRef.current = null;
      setRenderGrid(cleanGrid);
      setGamePhase('gameover');
      isLandingRef.current = false;
      return;
    }

    gridRef.current = cleanGrid;
    pieceRef.current = null;
    setRenderGrid(cleanGrid);

    // After short delay, show next question
    setTimeout(() => {
      isLandingRef.current = false;
      spawnQuestion(cardsRef.current);
    }, 300);
  }, [spawnQuestion]);

  // ---- Tick: move piece one step down ----
  const tick = useCallback(() => {
    if (gamePhaseRef.current !== 'falling') return;
    const piece = pieceRef.current;
    if (!piece) return;

    if (checkCollision(piece.shape, piece.x, piece.y + 1, gridRef.current)) {
      landPiece();
    } else {
      const moved = { ...piece, y: piece.y + 1 };
      pieceRef.current = moved;
      setRenderGrid(computeRenderGrid(gridRef.current, moved));
    }
  }, [checkCollision, landPiece, computeRenderGrid]);

  // ---- Spawn piece after answering ----
  const spawnPiece = useCallback((isCorrect: boolean) => {
    clearInterval(fallIntervalRef.current);
    isLandingRef.current = false;

    const shapeIdx = Math.floor(Math.random() * SHAPES.length);
    const shape = SHAPES[shapeIdx];
    const colorIndex = shapeIdx + 1;
    const newPiece: PieceState = {
      shape,
      colorIndex,
      x: Math.floor((COLS - shape[0].length) / 2),
      y: 0,
    };

    // Immediate game over check
    if (checkCollision(newPiece.shape, newPiece.x, newPiece.y, gridRef.current)) {
      setGamePhase('gameover');
      return;
    }

    pieceRef.current = newPiece;
    controlRef.current = isCorrect;
    setControlEnabled(isCorrect);
    setGamePhase('falling');
    setRenderGrid(computeRenderGrid(gridRef.current, newPiece));

    const speed = isCorrect ? 700 : 60;
    fallIntervalRef.current = setInterval(tick, speed);
  }, [checkCollision, computeRenderGrid, tick]);

  // ---- Answer handler ----
  const handleAnswer = useCallback((selectedOption: string) => {
    if (!currentCard) return;
    const correctText = currentCard.back.replace(/<[^>]*>/g, '');
    if (selectedOption === correctText) {
      message.success('Đúng rồi! Hãy di chuyển gạch.');
      setScore(prev => prev + 20);
      spawnPiece(true);
    } else {
      message.error('Sai rồi! Khối gạch sẽ rơi tự do.');
      spawnPiece(false);
    }
  }, [currentCard, spawnPiece]);

  // ---- Keyboard controls — no stale closure via refs ----
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gamePhaseRef.current !== 'falling') return;
      if (!controlRef.current) return;

      const piece = pieceRef.current;
      if (!piece) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const nx = piece.x - 1;
        if (!checkCollision(piece.shape, nx, piece.y, gridRef.current)) {
          const updated = { ...piece, x: nx };
          pieceRef.current = updated;
          setRenderGrid(computeRenderGrid(gridRef.current, updated));
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const nx = piece.x + 1;
        if (!checkCollision(piece.shape, nx, piece.y, gridRef.current)) {
          const updated = { ...piece, x: nx };
          pieceRef.current = updated;
          setRenderGrid(computeRenderGrid(gridRef.current, updated));
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const rotated = rotateMatrix(piece.shape);
        if (!checkCollision(rotated, piece.x, piece.y, gridRef.current)) {
          const updated = { ...piece, shape: rotated };
          pieceRef.current = updated;
          setRenderGrid(computeRenderGrid(gridRef.current, updated));
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        // Hard drop one step immediately
        tick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [checkCollision, computeRenderGrid, tick]);

  // On-screen button controls
  const handleMoveLeft = () => {
    if (gamePhaseRef.current !== 'falling' || !controlRef.current) return;
    const piece = pieceRef.current;
    if (!piece) return;
    const nx = piece.x - 1;
    if (!checkCollision(piece.shape, nx, piece.y, gridRef.current)) {
      const updated = { ...piece, x: nx };
      pieceRef.current = updated;
      setRenderGrid(computeRenderGrid(gridRef.current, updated));
    }
  };

  const handleMoveRight = () => {
    if (gamePhaseRef.current !== 'falling' || !controlRef.current) return;
    const piece = pieceRef.current;
    if (!piece) return;
    const nx = piece.x + 1;
    if (!checkCollision(piece.shape, nx, piece.y, gridRef.current)) {
      const updated = { ...piece, x: nx };
      pieceRef.current = updated;
      setRenderGrid(computeRenderGrid(gridRef.current, updated));
    }
  };

  const handleRotate = () => {
    if (gamePhaseRef.current !== 'falling' || !controlRef.current) return;
    const piece = pieceRef.current;
    if (!piece) return;
    const rotated = rotateMatrix(piece.shape);
    if (!checkCollision(rotated, piece.x, piece.y, gridRef.current)) {
      const updated = { ...piece, shape: rotated };
      pieceRef.current = updated;
      setRenderGrid(computeRenderGrid(gridRef.current, updated));
    }
  };

  const handleDropFast = () => {
    if (gamePhaseRef.current !== 'falling' || !controlRef.current) return;
    tick();
  };

  // ---- Initialize / Start Game ----
  useEffect(() => {
    if (visible) {
      loadDecks();
      resetGame();
    } else {
      clearInterval(fallIntervalRef.current);
    }
  }, [visible]);

  const resetGame = () => {
    clearInterval(fallIntervalRef.current);
    gridRef.current = emptyGrid();
    pieceRef.current = null;
    cardsRef.current = [];
    isLandingRef.current = false;
    setGamePhase('select');
    setSelectedDeckId(null);
    setScore(0);
    setLinesCleared(0);
    setCurrentCard(null);
    setOptions([]);
    setControlEnabled(true);
    setRenderGrid(emptyGrid());
  };

  const handleStartGame = async () => {
    if (!selectedDeckId) { message.error('Vui lòng chọn một bộ thẻ!'); return; }
    const hide = message.loading('Đang tải thẻ học...', 0);
    try {
      const deckCards = await getDeckCards(selectedDeckId);
      hide();
      if (!deckCards || deckCards.length < 4) {
        message.error('Bộ thẻ cần có ít nhất 4 thẻ để chơi!');
        return;
      }
      cardsRef.current = deckCards;
      gridRef.current = emptyGrid();
      pieceRef.current = null;
      isLandingRef.current = false;
      setScore(0);
      setLinesCleared(0);
      setRenderGrid(emptyGrid());
      spawnQuestion(deckCards);
    } catch {
      hide();
      message.error('Không tải được danh sách thẻ!');
    }
  };

  // ---- Cleanup on unmount ----
  useEffect(() => {
    return () => clearInterval(fallIntervalRef.current);
  }, []);

  const handleCollectXp = async () => {
    const xpEarned = Math.floor(score / 8);
    if (xpEarned > 0 && user) {
      try {
        await updateUserProfile({ displayName: user.displayName, email: user.email, avatarIndex: user.avatarIndex, avatarUrl: user.avatarUrl });
        message.success(`Chúc mừng! Bạn nhận được +${xpEarned} XP từ trò chơi xếp gạch!`);
      } catch {
        message.error('Không lưu được điểm XP');
      }
    }
    onCancel();
  };

  return (
    <Modal
      title={
        <Space style={{ color: '#2f855a' }}>
          <BorderOuterOutlined style={{ fontSize: '20px' }} />
          <span>Cờ thế giới — Xếp gạch từ vựng (Tetris)</span>
        </Space>
      }
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={780}
      bodyStyle={{ background: '#0b0f19', color: '#ffffff', minHeight: '480px', borderRadius: '0 0 16px 16px', padding: '24px' }}
      style={{ top: 50 }}
      destroyOnClose
    >
      {/* SELECT DECK */}
      {gamePhase === 'select' && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <BorderOuterOutlined style={{ fontSize: '80px', color: '#00f0f0', marginBottom: '24px' }} />
          <Title level={2} style={{ color: '#ffffff', marginBottom: '16px' }}>Cờ thế giới (Xếp gạch từ vựng)</Title>
          <Text style={{ color: '#b9c1d9', fontSize: '15px', display: 'block', maxWidth: '480px', margin: '0 auto 32px' }}>
            Kết hợp học từ vựng và Tetris cổ điển. Trả lời đúng để điều khiển gạch tự do. Trả lời sai thì gạch rơi nhanh mà bạn không kiểm soát được!
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
          <Button type="primary" size="large" onClick={handleStartGame}
            style={{ background: '#2f855a', borderColor: '#2f855a', height: '48px', borderRadius: '24px', padding: '0 40px', fontWeight: 'bold' }}>
            Bắt đầu chơi
          </Button>
        </div>
      )}

      {/* PLAYING (question or falling) */}
      {(gamePhase === 'question' || gamePhase === 'falling') && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
          {/* Left: Tetris Board */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
              <Text style={{ color: '#ffffff' }}>Điểm: <strong style={{ color: '#ffb703' }}>{score}</strong></Text>
              <Text style={{ color: '#ffffff' }}>Hàng đã ăn: <strong style={{ color: '#00f0f0' }}>{linesCleared}</strong></Text>
            </div>

            {/* Board */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${COLS}, 1fr)`,
              gap: '1px',
              background: '#1f2937',
              border: '4px solid #374151',
              borderRadius: '8px',
              width: '260px',
              height: '416px',
              padding: '2px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}>
              {renderGrid.map((row, r) =>
                row.map((cellColorIdx, c) => {
                  const isFilled = cellColorIdx !== 0;
                  return (
                    <div
                      key={`${r}-${c}`}
                      style={{
                        background: COLORS[cellColorIdx] || 'transparent',
                        border: isFilled ? '1px solid rgba(255,255,255,0.2)' : 'none',
                        borderRadius: isFilled ? '3px' : '0',
                        boxShadow: isFilled ? 'inset 0 0 6px rgba(0,0,0,0.5)' : 'none',
                      }}
                    />
                  );
                })
              )}
            </div>

            {/* On-screen controls */}
            {gamePhase === 'falling' && controlEnabled && (
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Button size="small" style={{ background: '#1f2937', color: '#fff', border: '1px solid #374151' }} onClick={handleMoveLeft}>◀ Trái</Button>
                <Button size="small" style={{ background: '#1f2937', color: '#fff', border: '1px solid #374151' }} onClick={handleRotate}>Rotate ↻</Button>
                <Button size="small" style={{ background: '#1f2937', color: '#fff', border: '1px solid #374151' }} onClick={handleMoveRight}>Phải ▶</Button>
                <Button size="small" style={{ background: '#1f2937', color: '#fff', border: '1px solid #374151' }} onClick={handleDropFast}>Rơi nhanh 🔽</Button>
              </div>
            )}
          </div>

          {/* Right: Question panel */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '380px' }}>
            {gamePhase === 'question' && currentCard ? (
              <div>
                <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px', marginBottom: '24px', textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>THUẬT NGỮ</Text>
                  <Text strong style={{ color: '#ffffff', fontSize: '20px' }}>
                    {currentCard.front.replace(/<[^>]*>/g, '')}
                  </Text>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {options.map((option, idx) => (
                    <Button
                      key={idx}
                      onClick={() => handleAnswer(option)}
                      style={{
                        background: '#1f2937', color: '#ffffff', border: '1px solid #374151',
                        borderRadius: '10px', height: '48px', textAlign: 'left',
                        padding: '0 16px', fontSize: '14px', fontWeight: 600,
                        transition: 'all 0.2s',
                      }}
                      className="tetris-option-btn"
                    >
                      {idx + 1}. {option}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <Title level={4} style={{ color: '#ffffff', marginBottom: '16px' }}>
                  {controlEnabled ? 'Đang xếp gạch... 🎮' : 'Đang rơi tự do... ⚠️'}
                </Title>
                <Progress
                  percent={100}
                  status={controlEnabled ? 'active' : 'exception'}
                  showInfo={false}
                  strokeColor={controlEnabled ? '#00f0f0' : '#f00000'}
                />
                <Text style={{ color: '#b9c1d9', marginTop: '12px', display: 'block' }}>
                  {controlEnabled
                    ? 'Bạn trả lời ĐÚNG! Hãy dùng các phím mũi tên ◀ ▲ ▶ ▼ trên bàn phím để di chuyển/xoay gạch!'
                    : 'Bạn trả lời SAI! Khối gạch đang tự rơi tự do xuống đáy, bạn không thể điều khiển.'}
                </Text>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GAME OVER */}
      {gamePhase === 'gameover' && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <TrophyOutlined style={{ fontSize: '80px', color: '#ffb703', marginBottom: '24px' }} />
          <Title level={2} style={{ color: '#ffffff', marginBottom: '8px' }}>Trò chơi kết thúc!</Title>
          <Text style={{ color: '#b9c1d9', fontSize: '16px', display: 'block', marginBottom: '32px' }}>
            Khối gạch đã chạm đỉnh bảng xếp.
          </Text>
          <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '16px', padding: '24px', maxWidth: '320px', margin: '0 auto 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <Text style={{ color: '#b9c1d9' }}>Điểm số:</Text>
              <Text strong style={{ color: '#ffffff', fontSize: '18px' }}>{score}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #1f2937', paddingTop: '12px' }}>
              <Text style={{ color: '#b9c1d9' }}>XP nhận được:</Text>
              <Text strong style={{ color: '#38b000', fontSize: '20px' }}>+{Math.floor(score / 8)} XP</Text>
            </div>
          </div>
          <Button type="primary" size="large" onClick={handleCollectXp}
            style={{ background: '#2f855a', borderColor: '#2f855a', height: '48px', borderRadius: '24px', padding: '0 40px', fontWeight: 'bold' }}>
            Nhận XP & Đóng
          </Button>
        </div>
      )}

      <style>{`
        .tetris-option-btn:hover {
          background: #2f855a !important;
          border-color: #2f855a !important;
          transform: translateX(4px);
        }
      `}</style>
    </Modal>
  );
};

export default GameTetrisModal;
