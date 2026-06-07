import prisma from '../config/prisma';
import { CardStatus } from '@prisma/client';

export async function findCardsByUserId(userId: string) {
  return prisma.card.findMany({
    where: {
      deck: {
        userId,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function findCardByIdAndUserId(id: string, userId: string) {
  return prisma.card.findFirst({
    where: {
      id,
      deck: {
        userId,
      },
    },
  });
}

export async function findCardsByDeckId(deckId: string) {
  return prisma.card.findMany({
    where: { deckId },
    orderBy: {
      createdAt: 'asc',
    },
  });
}

export async function findCardsByDeckIdDesc(deckId: string) {
  return prisma.card.findMany({
    where: { deckId },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function createCard(tx: any, data: { deckId: string; front: string; back: string; imageUrl?: string | null; frontLanguage?: string | null; backLanguage?: string | null }) {
  const client = tx || prisma;
  return client.card.create({
    data,
  });
}

export async function updateCard(tx: any, id: string, data: { front?: string; back?: string; status?: CardStatus; lastReviewed?: Date; reviewCount?: any; reviewFlag?: boolean; imageUrl?: string | null; frontLanguage?: string | null; backLanguage?: string | null }) {
  const client = tx || prisma;
  return client.card.update({
    where: { id },
    data,
  });
}

export async function deleteCard(id: string) {
  return prisma.card.delete({
    where: { id },
  });
}

export async function countCardsByUserId(userId: string) {
  return prisma.card.count({
    where: {
      deck: {
        userId,
      },
    },
  });
}
