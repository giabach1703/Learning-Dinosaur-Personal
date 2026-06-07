import api from './api';
import { User, Deck, Card, StudyLog, Badge, CardStatus, ReviewResult, StatsOverview, WeeklyStat } from './typing';

const TOKEN_KEY = 'learning_dinosaur_token';
const USER_KEY = 'learning_dinosaur_user';

const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10000; // 10 seconds

async function fetchWithCache(url: string, params?: any) {
  const cacheKey = JSON.stringify({ url, params });
  const cached = apiCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  const response = await api.get(url, { params });
  const data = response.data.data;
  apiCache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}

function clearCache() {
  apiCache.clear();
}

api.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toLowerCase();
    if (method && ['post', 'put', 'delete', 'patch'].includes(method)) {
      clearCache();
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==========================================
// AUTH SERVICES
// ==========================================

export async function register(payload: { email: string; password?: string; displayName: string }): Promise<User> {
  const response = await api.post('/auth/register', payload);
  const { token, user } = response.data;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export async function login(payload: { email: string; password?: string }): Promise<User> {
  const response = await api.post('/auth/login', payload);
  const { token, user } = response.data;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export async function loginWithGoogle(idToken: string): Promise<User> {
  const response = await api.post('/auth/google', { idToken });
  const { token, user } = response.data;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export async function getMe(): Promise<User> {
  const response = await api.get('/auth/me');
  const { user } = response.data;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export async function updateProfile(payload: { displayName?: string; email?: string; avatarIndex?: number; avatarUrl?: string | null }): Promise<User> {
  const response = await api.put('/auth/profile', payload);
  const { user } = response.data;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getCurrentUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function updateCurrentUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// ==========================================
// DECK SERVICES
// ==========================================

export async function getAllDecks(params: { tag?: string; search?: string } = {}): Promise<Deck[]> {
  return fetchWithCache('/decks', params);
}

export async function getDeckById(deckId: string): Promise<Deck> {
  const response = await api.get(`/decks/${deckId}`);
  return response.data.data;
}

export async function createDeck(payload: { name: string; description?: string; tags?: string[] }): Promise<Deck> {
  const response = await api.post('/decks', payload);
  return response.data.data;
}

export async function updateDeck(deckId: string, payload: { name: string; description?: string; tags?: string[] }): Promise<Deck> {
  const response = await api.put(`/decks/${deckId}`, payload);
  return response.data.data;
}

export async function deleteDeck(deckId: string): Promise<{ message: string }> {
  const response = await api.delete(`/decks/${deckId}`);
  return response.data;
}

export async function getAllTags(): Promise<string[]> {
  const response = await api.get('/decks/tags/all');
  return response.data.data;
}

export async function getDeckCards(deckId: string): Promise<Card[]> {
  const response = await api.get(`/decks/${deckId}/cards`);
  return response.data.data;
}

export async function createCardInDeck(deckId: string, payload: { front: string; back: string; imageUrl?: string; frontLanguage?: string; backLanguage?: string }): Promise<Card> {
  const response = await api.post(`/decks/${deckId}/cards`, payload);
  return response.data.data;
}

// ==========================================
// CARD SERVICES
// ==========================================

export async function getAllCards(): Promise<Card[]> {
  const response = await api.get('/cards');
  return response.data.data;
}

export async function updateCard(cardId: string, payload: { front: string; back: string; imageUrl?: string; frontLanguage?: string; backLanguage?: string; status?: string }): Promise<Card> {
  const response = await api.put(`/cards/${cardId}`, payload);
  return response.data.data;
}

export async function deleteCard(cardId: string): Promise<{ message: string }> {
  const response = await api.delete(`/cards/${cardId}`);
  return response.data;
}

export async function toggleReviewFlag(cardId: string): Promise<Card> {
  const response = await api.patch(`/cards/${cardId}/review-flag`);
  return response.data.data;
}

// ==========================================
// STUDY SERVICES
// ==========================================

export interface ReviewResponse {
  card: Card;
  studyLog: StudyLog;
  user: User;
  xpEarned: number;
  unlockedBadges: Badge[];
}

export async function getStudySession(deckId: string, options: { reviewOnly?: boolean } = {}): Promise<Card[]> {
  const response = await api.get(`/study/decks/${deckId}/session`, {
    params: {
      reviewOnly: options.reviewOnly ? 'true' : 'false'
    },
  });
  return response.data.data;
}

export async function reviewCard(cardId: string, result: ReviewResult): Promise<ReviewResponse> {
  const response = await api.post(`/study/cards/${cardId}/review`, { result });
  const responseData = response.data.data;
  if (responseData.user) {
    updateCurrentUser(responseData.user);
  }
  return responseData;
}

// ==========================================
// STATS SERVICES
// ==========================================

export async function getStatsOverview(): Promise<StatsOverview> {
  return fetchWithCache('/stats/overview');
}

export async function getWeeklyStats(): Promise<WeeklyStat[]> {
  return fetchWithCache('/stats/weekly');
}

// ==========================================
// BADGE SERVICES
// ==========================================

export async function getBadges(): Promise<Badge[]> {
  const response = await api.get('/badges');
  return response.data.data;
}

// ==========================================
// SEARCH SERVICES
// ==========================================

export interface SearchResults {
  decks: Deck[];
  cards: Card[];
}

export async function globalSearch(keyword: string): Promise<SearchResults> {
  const response = await api.get('/search', {
    params: {
      q: keyword,
    },
  });
  return response.data.data;
}
