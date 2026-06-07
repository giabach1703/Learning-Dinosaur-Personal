import prisma from '../config/prisma';

export async function findDecksByUserId(userId: string) {
  return prisma.deck.findMany({
    where: { userId },
    include: {
      cards: true,
      deckTags: {
        include: {
          tag: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function findDeckByIdAndUserId(id: string, userId: string) {
  return prisma.deck.findFirst({
    where: { id, userId },
    include: {
      cards: true,
      deckTags: {
        include: {
          tag: true,
        },
      },
    },
  });
}

export async function findDeckById(id: string) {
  return prisma.deck.findUnique({
    where: { id },
  });
}

export async function findDeckByIdAndUserIdSimple(id: string, userId: string) {
  return prisma.deck.findFirst({
    where: { id, userId },
  });
}

export async function createDeck(tx: any, data: { userId: string; name: string; description?: string }) {
  const client = tx || prisma;
  return client.deck.create({
    data,
  });
}

export async function updateDeck(tx: any, id: string, data: { name: string; description?: string }) {
  const client = tx || prisma;
  return client.deck.update({
    where: { id },
    data,
  });
}

export async function deleteDeck(id: string) {
  return prisma.deck.delete({
    where: { id },
  });
}
