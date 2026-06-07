import { Request, Response, NextFunction } from 'express';
import { getBadgesForUser } from '../services/badgeService';

export async function getBadges(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Bạn chưa đăng nhập' });
    }
    const badges = await getBadgesForUser(req.user.id);
    return res.json({
      data: badges,
    });
  } catch (error) {
    next(error);
  }
}
