import prisma from '../config/prisma';

export async function findTagsByUserId(userId: string) {
  return prisma.tag.findMany({
    where: { userId },
    orderBy: {
      name: 'asc',
    },
  });
}

export async function upsertTag(tx: any, userId: string, name: string) {
  const client = tx || prisma;
  return client.tag.upsert({
    where: {
      userId_name: {
        userId,
        name,
      },
    },
    update: {},
    create: {
      userId,
      name,
    },
  });
}

export async function createDeckTag(tx: any, deckId: string, tagId: string) {
  const client = tx || prisma;
  return client.deckTag.create({
    data: {
      deckId,
      tagId,
    },
  });
}

export async function deleteDeckTagsByDeckId(tx: any, deckId: string) {
  const client = tx || prisma;
  return client.deckTag.deleteMany({
    where: { deckId },
  });
}
