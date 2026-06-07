import prisma from '../config/prisma';
import { ReviewResult } from '@prisma/client';

export async function findStudyLogsByUserId(userId: string) {
  return prisma.studyLog.findMany({
    where: { userId },
  });
}

export async function countStudyLogsByUserId(userId: string) {
  return prisma.studyLog.count({
    where: { userId },
  });
}

export async function createStudyLog(tx: any, data: { userId: string; deckId: string; cardId: string; result: ReviewResult; xpEarned: number }) {
  const client = tx || prisma;
  return client.studyLog.create({
    data,
  });
}
