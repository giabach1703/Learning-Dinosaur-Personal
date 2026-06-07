import { Request, Response, NextFunction } from 'express';
import * as cardService from '../services/cardService';

export async function getCards(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Bạn chưa đăng nhập' });
    const cards = await cardService.getUserCards(req.user.id);
    return res.json({
      data: cards,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCard(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Bạn chưa đăng nhập' });
    const { cardId } = req.params;
    const { front, back, status, imageUrl, frontLanguage, backLanguage } = req.body;

    const card = await cardService.updateCardDetails(cardId, req.user.id, { front, back, status, imageUrl, frontLanguage, backLanguage });
    return res.json({
      message: 'Cập nhật thẻ thành công',
      data: card,
    });
  } catch (error: any) {
    if (
      error.message === 'Mặt trước không được để trống' ||
      error.message === 'Mặt sau không được để trống'
    ) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === 'Không tìm thấy thẻ') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
}

export async function deleteCard(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Bạn chưa đăng nhập' });
    const { cardId } = req.params;

    await cardService.deleteCardFromDeck(cardId, req.user.id);
    return res.json({
      message: 'Xóa thẻ thành công',
    });
  } catch (error: any) {
    if (error.message === 'Không tìm thấy thẻ') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
}

export async function toggleReviewFlag(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Bạn chưa đăng nhập' });
    const { cardId } = req.params;

    const card = await cardService.toggleCardReviewFlag(cardId, req.user.id);
    return res.json({
      message: 'Cập nhật trạng thái cần xem lại thành công',
      data: card,
    });
  } catch (error: any) {
    if (error.message === 'Không tìm thấy thẻ') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
}
