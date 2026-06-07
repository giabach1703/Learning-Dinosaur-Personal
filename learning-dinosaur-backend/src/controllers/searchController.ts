import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

function formatDeck(deck: any) {
  const tags = deck.deckTags?.map((deckTag: any) => deckTag.tag.name) || [];

  return {
    type: 'deck',
    id: deck.id,
    name: deck.name,
    description: deck.description || '',
    tags,
    url: `/decks/${deck.id}`,
  };
}

function formatCard(card: any) {
  return {
    type: 'card',
    id: card.id,
    deckId: card.deckId,
    front: card.front,
    back: card.back,
    deckName: card.deck?.name || '',
    url: `/decks/${card.deckId}`,
  };
}

export async function globalSearch(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Bạn chưa đăng nhập' });
    const keyword = String(req.query.q || '').trim();

    if (!keyword) {
      return res.json({
        data: {
          decks: [],
          cards: [],
        },
      });
    }

    const decks = await prisma.deck.findMany({
      where: {
        userId: req.user.id,
        OR: [
          {
            name: {
              contains: keyword,
            },
          },
          {
            description: {
              contains: keyword,
            },
          },
          {
            deckTags: {
              some: {
                tag: {
                  name: {
                    contains: keyword,
                  },
                },
              },
            },
          },
        ],
      },
      include: {
        deckTags: {
          include: {
            tag: true,
          },
        },
      },
      take: 8,
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const cards = await prisma.card.findMany({
      where: {
        deck: {
          userId: req.user.id,
        },
        OR: [
          {
            front: {
              contains: keyword,
            },
          },
          {
            back: {
              contains: keyword,
            },
          },
        ],
      },
      include: {
        deck: true,
      },
      take: 8,
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return res.json({
      data: {
        decks: decks.map(formatDeck),
        cards: cards.map(formatCard),
      },
    });
  } catch (error) {
    next(error);
  }
}
