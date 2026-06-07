import prisma from '../config/prisma';
import * as deckRepository from '../repositories/deckRepository';
import * as tagRepository from '../repositories/tagRepository';

export async function getUserDecks(userId: string, filter?: { tag?: string; search?: string }) {
  const decks = await deckRepository.findDecksByUserId(userId);
  let result = decks.map(formatDeck);

  if (filter?.tag) {
    result = result.filter((deckItem) => deckItem.tags.includes(String(filter.tag)));
  }

  if (filter?.search) {
    const keyword = String(filter.search).toLowerCase();
    result = result.filter((deckItem) => {
      return (
        deckItem.name.toLowerCase().includes(keyword) ||
        deckItem.description.toLowerCase().includes(keyword) ||
        deckItem.tags.some((item: string) => item.toLowerCase().includes(keyword))
      );
    });
  }

  return result;
}

export async function getUserDeckById(deckId: string, userId: string) {
  const deck = await deckRepository.findDeckByIdAndUserId(deckId, userId);
  if (!deck) return null;
  return formatDeck(deck);
}

export async function createDeckWithTags(userId: string, data: { name: string; description?: string; tags?: string[] }) {
  const { name, description = '', tags = [] } = data;
  
  const normalizedTags = [
    ...new Set(
      tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean)
    ),
  ];

  // Wrap in a transaction
  return prisma.$transaction(async (tx) => {
    const deck = await deckRepository.createDeck(tx, {
      userId,
      name: name.trim(),
      description,
    });

    for (const tagName of normalizedTags) {
      const tag = await tagRepository.upsertTag(tx, userId, tagName);
      await tagRepository.createDeckTag(tx, deck.id, tag.id);
    }

    const createdDeck = await tx.deck.findFirst({
      where: { id: deck.id, userId },
      include: {
        cards: true,
        deckTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return formatDeck(createdDeck);
  });
}

export async function updateDeckWithTags(deckId: string, userId: string, data: { name: string; description?: string; tags?: string[] }) {
  const { name, description = '', tags = [] } = data;

  const existingDeck = await deckRepository.findDeckByIdAndUserIdSimple(deckId, userId);
  if (!existingDeck) {
    throw new Error('Không tìm thấy bộ thẻ');
  }

  const normalizedTags = [
    ...new Set(
      tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean)
    ),
  ];

  // Wrap in transaction
  return prisma.$transaction(async (tx) => {
    await deckRepository.updateDeck(tx, deckId, {
      name: name.trim(),
      description,
    });

    await tagRepository.deleteDeckTagsByDeckId(tx, deckId);

    for (const tagName of normalizedTags) {
      const tag = await tagRepository.upsertTag(tx, userId, tagName);
      await tagRepository.createDeckTag(tx, deckId, tag.id);
    }

    const updatedDeck = await tx.deck.findFirst({
      where: { id: deckId, userId },
      include: {
        cards: true,
        deckTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return formatDeck(updatedDeck);
  });
}

export async function deleteUserDeck(deckId: string, userId: string) {
  const existingDeck = await deckRepository.findDeckByIdAndUserIdSimple(deckId, userId);
  if (!existingDeck) {
    throw new Error('Không tìm thấy bộ thẻ');
  }

  await deckRepository.deleteDeck(deckId);
  return true;
}

export async function getUserTags(userId: string) {
  const tags = await tagRepository.findTagsByUserId(userId);
  return tags.map((tag) => tag.name);
}

function formatDeck(deck: any) {
  const cards = deck.cards || [];
  const tags = deck.deckTags?.map((deckTag: any) => deckTag.tag.name) || [];

  return {
    id: deck.id,
    name: deck.name,
    description: deck.description || '',
    tags,
    totalCards: cards.length,
    masteredCards: cards.filter((card: any) => card.status === 'MASTERED').length,
    createdAt: deck.createdAt,
    updatedAt: deck.updatedAt,
  };
}
