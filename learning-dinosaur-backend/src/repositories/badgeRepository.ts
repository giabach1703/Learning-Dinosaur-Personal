import prisma from '../config/prisma';

export async function findBadgeByCode(code: string) {
  return prisma.badge.findUnique({
    where: { code },
  });
}

export async function upsertBadge(code: string, name: string, description: string) {
  return prisma.badge.upsert({
    where: { code },
    update: { name, description },
    create: { code, name, description },
  });
}

export async function findUserBadge(userId: string, badgeId: string) {
  return prisma.userBadge.findUnique({
    where: {
      userId_badgeId: {
        userId,
        badgeId,
      },
    },
  });
}

export async function createUserBadge(userId: string, badgeId: string) {
  return prisma.userBadge.create({
    data: {
      userId,
      badgeId,
    },
    include: {
      badge: true,
    },
  });
}

export async function findUserBadgesByUserId(userId: string) {
  return prisma.userBadge.findMany({
    where: { userId },
    include: {
      badge: true,
    },
  });
}

export async function findAllBadgesWithUserBadges(userId: string) {
  return prisma.badge.findMany({
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
}
