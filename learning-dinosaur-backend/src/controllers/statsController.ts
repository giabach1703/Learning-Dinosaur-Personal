import { Request, Response, NextFunction } from 'express';
import * as statsService from '../services/statsService';

export async function getOverview(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Bạn chưa đăng nhập' });

    const stats = await statsService.getOverviewStats(
      req.user.id,
      req.user.xp || 0,
      req.user.currentStreak || 0
    );

    return res.json({
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}

export async function getWeeklyStats(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Bạn chưa đăng nhập' });

    const data = await statsService.getWeeklyStudyStats(req.user.id);

    return res.json({
      data,
    });
  } catch (error) {
    next(error);
  }
}
