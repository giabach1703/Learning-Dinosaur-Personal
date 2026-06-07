export interface User {
  id: string;
  email: string;
  displayName: string;
  xp: number;
  currentStreak: number;
  lastStudyDate: string | null;
  createdAt: string;
  updatedAt: string;
  avatarIndex: number;
  avatarUrl?: string | null;
}

export interface StatsOverview {
  cardsStudiedToday: number;
  totalMasteredCards: number;
  totalStudyLogs: number;
  currentStreak: number;
  totalXP: number;
  currentLevel: string;
}

export interface WeeklyStat {
  date: string;
  count: number;
}

export type CardStatus = 'new' | 'mastered' | 'not_mastered';
export type ReviewResult = 'mastered' | 'not_mastered';

export interface Card {
  id: string;
  deckId: string;
  front: string;
  back: string;
  status: CardStatus;
  reviewFlag: boolean;
  lastReviewed: string | null;
  reviewCount: number;
  imageUrl?: string;
  frontLanguage?: string;
  backLanguage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  tags: string[];
  totalCards: number;
  masteredCards: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudyLog {
  id: string;
  userId: string;
  deckId: string;
  cardId: string;
  result: ReviewResult;
  xpEarned: number;
  studiedAt: string;
}

export interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface ApiResponse<T> {
  message?: string;
  data: T;
}
