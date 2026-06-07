import prisma from '../config/prisma';

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function findUserByGoogleId(googleId: string) {
  return prisma.user.findUnique({
    where: { googleId },
  });
}

export async function createUser(data: { email: string; passwordHash?: string; displayName: string; googleId?: string }) {
  return prisma.user.create({
    data,
  });
}

export async function updateUser(id: string, data: any) {
  return prisma.user.update({
    where: { id },
    data,
  });
}

export async function updateUserXp(id: string, xp: number) {
  return prisma.user.update({
    where: { id },
    data: { xp },
  });
}
