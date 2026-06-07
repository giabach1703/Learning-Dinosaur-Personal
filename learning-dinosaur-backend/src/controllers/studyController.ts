import { Request, Response, NextFunction } from 'express';
import * as studyService from '../services/studyService';

export async function getStudySession(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Bạn chưa đăng nhập' });
    const { deckId } = req.params;
    const { reviewOnly } = req.query;

    const cards = await studyService.getStudySessionCards(
      deckId,
      req.user.id,
      reviewOnly === 'true'
    );

    return res.json({
      data: cards,
    });
  } catch (error: any) {
    if (error.message === 'Không tìm thấy bộ thẻ') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
}

export async function reviewCard(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Bạn chưa đăng nhập' });
    const { cardId } = req.params;
    const { result } = req.body;

    const data = await studyService.reviewStudyCard(cardId, req.user.id, result);

    return res.json({
      message: 'Lưu kết quả học thành công',
      data,
    });
  } catch (error: any) {
    if (error.message === 'Kết quả học không hợp lệ') {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === 'Không tìm thấy thẻ') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
}
