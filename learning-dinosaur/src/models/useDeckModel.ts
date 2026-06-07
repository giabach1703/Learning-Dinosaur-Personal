import { useState, useCallback } from 'react';
import { Deck, Card } from '../services/typing';
import { getAllDecks, getAllTags, getDeckById, getDeckCards } from '../services';

export default function useDeckModel() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  const [activeCards, setActiveCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const loadDecks = useCallback(async (params?: { tag?: string; search?: string }) => {
    setLoading(true);
    try {
      const data = await getAllDecks(params);
      setDecks(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTags = useCallback(async () => {
    try {
      const data = await getAllTags();
      setTags(data);
    } catch {
      setTags([]);
    }
  }, []);

  const loadDeckDetail = useCallback(async (deckId: string) => {
    setLoading(true);
    try {
      const [deckData, cardsData] = await Promise.all([
        getDeckById(deckId),
        getDeckCards(deckId)
      ]);
      setActiveDeck(deckData);
      setActiveCards(cardsData);
      return { deck: deckData, cards: cardsData };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    decks,
    setDecks,
    tags,
    setTags,
    activeDeck,
    setActiveDeck,
    activeCards,
    setActiveCards,
    loading,
    loadDecks,
    loadTags,
    loadDeckDetail,
  };
}
