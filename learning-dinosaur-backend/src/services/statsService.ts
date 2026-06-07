import * as studyLogRepository from '../repositories/studyLogRepository';
import * as cardRepository from '../repositories/cardRepository';
import * as userRepository from '../repositories/userRepository';

function getDateOnly(date: Date | string): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getLevelByXp(xp: number) {
  if (xp >= 3000) return { icon: '☄️', name: 'Khủng Long Bất Tử' };
  if (xp >= 1500) return { icon: '🐉', name: 'Khủng Long Thông Thái' };
  if (xp >= 700) return { icon: '🦖', name: 'T-Rex Mê Học' };
  if (xp >= 300) return { icon: '🦕', name: 'Khủng Long Học Việc' };
  if (xp >= 100) return { icon: '🦎', name: 'Khủng Long Bột' };
  return { icon: '🥚', name: 'Trứng Khủng Long' };
}

export async function getOverviewStats(userId: string, userXp: number, userStreak: number) {
  const today = getDateOnly(new Date());

  const logs = await studyLogRepository.findStudyLogsByUserId(userId);
  const cards = await cardRepository.findCardsByUserId(userId);

  const cardsStudiedToday = logs.filter(
    (log) => getDateOnly(log.studiedAt) === today
  ).length;

  const totalMasteredCards = cards.filter(
    (card) => card.status === 'MASTERED'
  ).length;

  const level = getLevelByXp(userXp || 0);

  return {
    cardsStudiedToday,
    totalMasteredCards,
    totalStudyLogs: logs.length,
    currentStreak: userStreak || 0,
    totalXP: userXp || 0,
    currentLevel: `${level.icon} ${level.name}`,
  };
}

export async function getWeeklyStudyStats(userId: string) {
  const logs = await studyLogRepository.findStudyLogsByUserId(userId);
  const data: { date: string; count: number }[] = [];

  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);

    const dateText = getDateOnly(date);
    
    // Format: "DD/MM" in local timezone
    const displayDate = `${String(date.getDate()).padStart(2, '0')}/${String(
      date.getMonth() + 1
    ).padStart(2, '0')}`;

    const count = logs.filter(
      (log) => getDateOnly(log.studiedAt) === dateText
    ).length;

    data.push({
      date: displayDate,
      count,
    });
  }

  return data;
}
