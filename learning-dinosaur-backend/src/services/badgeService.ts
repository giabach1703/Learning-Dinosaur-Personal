import prisma from '../config/prisma';

interface DefaultBadge {
  code: string;
  name: string;
  description: string;
}

const DEFAULT_BADGES: DefaultBadge[] = [
  {
    code: 'FIRST_STEP',
    name: 'First Step',
    description: 'Học thẻ đầu tiên',
  },
  {
    code: 'STREAK_7',
    name: '7-Day Streak',
    description: 'Học liên tục 7 ngày',
  },
  {
    code: 'STUDY_100',
    name: '100 Cards',
    description: 'Học đủ 100 lượt thẻ',
  },
  {
    code: 'DECK_FINISHER',
    name: 'Deck Finisher',
    description: 'Hoàn thành toàn bộ một deck',
  },
  {
    code: 'DINOSAUR_LEGEND',
    name: 'Dinosaur Legend',
    description: 'Đạt cấp Khủng Long Bất Tử',
  },
];

export async function ensureDefaultBadges(tx?: any): Promise<void> {
  const client = tx || prisma;
  for (const badge of DEFAULT_BADGES) {
    await client.badge.upsert({
      where: {
        code: badge.code,
      },
      update: {
        name: badge.name,
        description: badge.description,
      },
      create: badge,
    });
  }
}

export async function unlockBadgeIfNeeded(
  userId: string,
  badgeCode: string,
  unlockedCodes: Set<string>,
  tx?: any
): Promise<any | null> {
  const client = tx || prisma;
  if (unlockedCodes.has(badgeCode)) {
    return null;
  }

  const badge = await client.badge.findUnique({
    where: {
      code: badgeCode,
    },
  });

  if (!badge) {
    return null;
  }

  const userBadge = await client.userBadge.create({
    data: {
      userId,
      badgeId: badge.id,
    },
    include: {
      badge: true,
    },
  });

  unlockedCodes.add(badgeCode);

  return userBadge;
}

export async function evaluateAndUnlockBadges(userId: string, tx?: any): Promise<any[]> {
  const client = tx || prisma;

  const user = await client.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return [];
  }

  const existingUserBadges = await client.userBadge.findMany({
    where: {
      userId,
    },
    include: {
      badge: true,
    },
  });

  const unlockedCodes = new Set<string>(
    existingUserBadges.map((userBadge) => userBadge.badge.code)
  );

  const studyLogsCount = await client.studyLog.count({
    where: {
      userId,
    },
  });

  const decks = await client.deck.findMany({
    where: {
      userId,
    },
    include: {
      cards: true,
    },
  });

  const hasFinishedDeck = decks.some((deck) => {
    return (
      deck.cards.length > 0 &&
      deck.cards.every((card) => card.status === 'MASTERED')
    );
  });

  const newlyUnlocked: any[] = [];

  if (studyLogsCount >= 1) {
    const unlocked = await unlockBadgeIfNeeded(
      userId,
      'FIRST_STEP',
      unlockedCodes,
      client
    );
    if (unlocked) newlyUnlocked.push(unlocked);
  }

  if ((user.currentStreak || 0) >= 7) {
    const unlocked = await unlockBadgeIfNeeded(
      userId,
      'STREAK_7',
      unlockedCodes,
      client
    );
    if (unlocked) newlyUnlocked.push(unlocked);
  }

  if (studyLogsCount >= 100) {
    const unlocked = await unlockBadgeIfNeeded(
      userId,
      'STUDY_100',
      unlockedCodes,
      client
    );
    if (unlocked) newlyUnlocked.push(unlocked);
  }

  if (hasFinishedDeck) {
    const unlocked = await unlockBadgeIfNeeded(
      userId,
      'DECK_FINISHER',
      unlockedCodes,
      client
    );
    if (unlocked) newlyUnlocked.push(unlocked);
  }

  if ((user.xp || 0) >= 3000) {
    const unlocked = await unlockBadgeIfNeeded(
      userId,
      'DINOSAUR_LEGEND',
      unlockedCodes,
      client
    );
    if (unlocked) newlyUnlocked.push(unlocked);
  }

  return newlyUnlocked;
}

export async function getBadgesForUser(userId: string): Promise<any[]> {
  // DB writes are removed from this GET path.
  // SEED is run on startup, and badge checks happen on study session completion.
  const badges = await prisma.badge.findMany({
    orderBy: {
      createdAt: 'asc',
    },
    include: {
      userBadges: {
        where: {
          userId,
        },
      },
    },
  });

  return badges.map((badge) => {
    const unlocked = badge.userBadges.length > 0;

    return {
      id: badge.id,
      code: badge.code,
      name: badge.name,
      description: badge.description,
      unlocked,
      unlockedAt: unlocked ? badge.userBadges[0].unlockedAt : null,
    };
  });
}
