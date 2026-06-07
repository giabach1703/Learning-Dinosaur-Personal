import { CardStatus } from '@prisma/client';
import * as cardRepository from '../repositories/cardRepository';
import * as deckRepository from '../repositories/deckRepository';

function toPrismaStatus(status: string): CardStatus {
  if (status === 'mastered') return 'MASTERED';
  if (status === 'not_mastered') return 'NOT_MASTERED';
  return 'NEW';
}

function toApiStatus(status: CardStatus): string {
  if (status === 'MASTERED') return 'mastered';
  if (status === 'NOT_MASTERED') return 'not_mastered';
  return 'new';
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
    imageUrl: card.imageUrl,
    frontLanguage: card.frontLanguage,
    backLanguage: card.backLanguage,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
  };
}

export async function getUserCards(userId: string) {
  const cards = await cardRepository.findCardsByUserId(userId);
  return cards.map(formatCard);
}

export async function getDeckCardsList(deckId: string, userId: string) {
  const deck = await deckRepository.findDeckByIdAndUserIdSimple(deckId, userId);
  if (!deck) {
    throw new Error('Không tìm thấy bộ thẻ');
  }

  const cards = await cardRepository.findCardsByDeckIdDesc(deckId);
  return cards.map(formatCard);
}

export async function createCardInDeck(deckId: string, userId: string, data: { front: string; back: string; imageUrl?: string | null; frontLanguage?: string | null; backLanguage?: string | null }) {
  const { front, back, imageUrl, frontLanguage, backLanguage } = data;
  if (!front || !front.trim() || !back || !back.trim()) {
    throw new Error('Mặt trước và mặt sau không được để trống');
  }

  const deck = await deckRepository.findDeckByIdAndUserIdSimple(deckId, userId);
  if (!deck) {
    throw new Error('Không tìm thấy bộ thẻ');
  }

  const card = await cardRepository.createCard(null, {
    deckId,
    front: front.trim(),
    back: back.trim(),
    imageUrl,
    frontLanguage,
    backLanguage,
  });

  return formatCard(card);
}

export async function updateCardDetails(cardId: string, userId: string, data: { front?: string; back?: string; status?: string; imageUrl?: string | null; frontLanguage?: string | null; backLanguage?: string | null }) {
  const { front, back, status, imageUrl, frontLanguage, backLanguage } = data;

  const card = await cardRepository.findCardByIdAndUserId(cardId, userId);
  if (!card) {
    throw new Error('Không tìm thấy thẻ');
  }

  const updateData: any = {};
  if (front !== undefined) {
    if (!front.trim()) throw new Error('Mặt trước không được để trống');
    updateData.front = front.trim();
  }
  if (back !== undefined) {
    if (!back.trim()) throw new Error('Mặt sau không được để trống');
    updateData.back = back.trim();
  }
  if (status !== undefined) {
    updateData.status = toPrismaStatus(status);
  }
  if (imageUrl !== undefined) {
    updateData.imageUrl = imageUrl;
  }
  if (frontLanguage !== undefined) {
    updateData.frontLanguage = frontLanguage;
  }
  if (backLanguage !== undefined) {
    updateData.backLanguage = backLanguage;
  }

  const updatedCard = await cardRepository.updateCard(null, cardId, updateData);
  return formatCard(updatedCard);
}

export async function deleteCardFromDeck(cardId: string, userId: string) {
  const card = await cardRepository.findCardByIdAndUserId(cardId, userId);
  if (!card) {
    throw new Error('Không tìm thấy thẻ');
  }

  await cardRepository.deleteCard(cardId);
  return true;
}

export async function toggleCardReviewFlag(cardId: string, userId: string) {
  const card = await cardRepository.findCardByIdAndUserId(cardId, userId);
  if (!card) {
    throw new Error('Không tìm thấy thẻ');
  }

  const updatedCard = await cardRepository.updateCard(null, cardId, {
    reviewFlag: !card.reviewFlag,
  });

  return formatCard(updatedCard);
}
