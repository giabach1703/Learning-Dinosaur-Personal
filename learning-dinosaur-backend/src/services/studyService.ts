import prisma from '../config/prisma';
import { CardStatus, ReviewResult } from '@prisma/client';
import * as cardRepository from '../repositories/cardRepository';
import * as deckRepository from '../repositories/deckRepository';
import * as studyLogRepository from '../repositories/studyLogRepository';
import { evaluateAndUnlockBadges } from './badgeService';

function toApiStatus(status: CardStatus): string {
  if (status === 'MASTERED') return 'mastered';
  if (status === 'NOT_MASTERED') return 'not_mastered';
  return 'new';
}

function toPrismaReviewResult(result: string): ReviewResult {
  if (result === 'mastered') return 'MASTERED';
  return 'NOT_MASTERED';
}

function formatCard(card: any) {
  return {
    id: card.id,
    deckId: card.deckId,
    front: card.front,
    back: card.back,
    status: toApiStatus(card.status),
    reviewFlag: card.reviewFlag,
    lastReviewed: card.lastReviewed,
    reviewCount: card.reviewCount,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
  };
}

function uniqueById(cards: any[]): any[] {
  const map = new Map();
  cards.forEach((card) => {
    if (!map.has(card.id)) {
      map.set(card.id, card);
    }
  });
  return Array.from(map.values());
}

function sortByOldestReviewed(cards: any[]): any[] {
  return [...cards].sort((a, b) => {
    if (!a.lastReviewed && !b.lastReviewed) return 0;
    if (!a.lastReviewed) return -1;
    if (!b.lastReviewed) return 1;
    return new Date(a.lastReviewed).getTime() - new Date(b.lastReviewed).getTime();
  });
}

function getDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function updateUserXpAndStreak(tx: any, userId: string, xpEarned: number) {
  const user = await tx.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) return null;

  const today = getDateOnly(new Date());
  const lastStudyDate = user.lastStudyDate
    ? getDateOnly(user.lastStudyDate)
    : null;

  let currentStreak = user.currentStreak || 0;

  if (!lastStudyDate) {
    currentStreak = 1;
  } else if (lastStudyDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayText = getDateOnly(yesterday);

    if (lastStudyDate === yesterdayText) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }
  }

  return tx.user.update({
    where: {
      id: userId,
    },
    data: {
      xp: user.xp + xpEarned,
      currentStreak,
      lastStudyDate: new Date(),
    },
    select: {
      id: true,
      email: true,
      displayName: true,
      xp: true,
      currentStreak: true,
      lastStudyDate: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getStudySessionCards(deckId: string, userId: string, reviewOnly = false) {
  const deck = await deckRepository.findDeckByIdAndUserIdSimple(deckId, userId);
  if (!deck) {
    throw new Error('Không tìm thấy bộ thẻ');
  }

  const allCards = await cardRepository.findCardsByDeckId(deckId);
  let selectedCards: any[] = [];

  if (reviewOnly) {
    selectedCards = allCards.filter((card) => card.reviewFlag);
  } else {
    const notMasteredCards = allCards.filter(
      (card) => card.status === 'NOT_MASTERED'
    );
    const reviewFlagCards = allCards.filter((card) => card.reviewFlag);
    const newCards = allCards.filter((card) => card.status === 'NEW');
    const oldestReviewedCards = sortByOldestReviewed(allCards);

    selectedCards = uniqueById([
      ...notMasteredCards,
      ...reviewFlagCards,
      ...newCards,
      ...oldestReviewedCards,
    ]);
  }

  return selectedCards.slice(0, 10).map(formatCard);
}

export async function reviewStudyCard(cardId: string, userId: string, result: string) {
  if (!['mastered', 'not_mastered'].includes(result)) {
    throw new Error('Kết quả học không hợp lệ');
  }

  // Wrap all db changes in transaction
  return prisma.$transaction(async (tx) => {
    const card = await tx.card.findFirst({
      where: {
        id: cardId,
        deck: {
          userId: userId,
        },
      },
    });

    if (!card) {
      throw new Error('Không tìm thấy thẻ');
    }

    const prismaResult = toPrismaReviewResult(result);
    
    // Weight-based XP system:
    // +1 XP if the card was already MASTERED before review.
    // +10 XP if card was NOT MASTERED and is now marked mastered.
    // +2 XP if card was NOT MASTERED and is marked not mastered.
    let xpEarned = 0;
    if (card.status === 'MASTERED') {
      xpEarned = 1;
    } else {
      xpEarned = result === 'mastered' ? 10 : 2;
    }

    const updatedCard = await tx.card.update({
      where: {
        id: cardId,
      },
      data: {
        status: prismaResult,
        lastReviewed: new Date(),
        reviewCount: {
          increment: 1,
        },
      },
    });

    const studyLog = await tx.studyLog.create({
      data: {
        userId,
        deckId: card.deckId,
        cardId: card.id,
        result: prismaResult,
        xpEarned,
      },
    });

    const updatedUser = await updateUserXpAndStreak(tx, userId, xpEarned);
    const unlockedBadges = await evaluateAndUnlockBadges(userId, tx);

    return {
      card: formatCard(updatedCard),
      studyLog,
      user: updatedUser,
      xpEarned,
      unlockedBadges,
    };
  }, {
    maxWait: 10000,
    timeout: 20000,
  });
}
