import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { verifyToken } from '../utils/jwt';

interface UserPayload {
  id: string;
  email: string;
  displayName: string;
  xp: number;
  currentStreak: number;
  lastStudyDate: Date | null;
  avatarIndex: number;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Bạn chưa đăng nhập',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        xp: true,
        currentStreak: true,
        lastStudyDate: true,
        avatarIndex: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: 'Token không hợp lệ',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn',
    });
  }
}

export default authMiddleware;
