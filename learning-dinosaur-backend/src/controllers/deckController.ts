import { Request, Response, NextFunction } from 'express';
import * as deckService from '../services/deckService';
import * as cardService from '../services/cardService';

export async function getDecks(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Bạn chưa đăng nhập' });
    const { tag, search } = req.query;

    const result = await deckService.getUserDecks(req.user.id, {
      tag: tag ? String(tag) : undefined,
      search: search ? String(search) : undefined,
    });

    return res.json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getDeckById(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Bạn chưa đăng nhập' });
    const { deckId } = req.params;

    const deck = await deckService.getUserDeckById(deckId, req.user.id);
    if (!deck) {
      return res.status(404).json({
        message: 'Không tìm thấy bộ thẻ',
      });
    }

    return res.json({
      data: deck,
    });
  } catch (error) {
    next(error);
  }
}

export async function createDeck(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Bạn chưa đăng nhập' });
    const { name, description, tags } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: 'Tên bộ thẻ không được để trống',
      });
    }

    const deck = await deckService.createDeckWithTags(req.user.id, {
      name,
      description,
      tags,
    });

    return res.status(201).json({
      message: 'Tạo bộ thẻ thành công',
      data: deck,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateDeck(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Bạn chưa đăng nhập' });
    const { deckId } = req.params;
    const { name, description, tags } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: 'Tên bộ thẻ không được để trống',
      });
    }

    const deck = await deckService.updateDeckWithTags(deckId, req.user.id, {
      name,
      description,
      tags,
    });

    return res.json({
      message: 'Cập nhật bộ thẻ thành công',
      data: deck,
    });
  } catch (error: any) {
    if (error.message === 'Không tìm thấy bộ thẻ') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
}

export async function deleteDeck(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Bạn chưa đăng nhập' });
    const { deckId } = req.params;

    await deckService.deleteUserDeck(deckId, req.user.id);

    return res.json({
      message: 'Xóa bộ thẻ thành công',
    });
  } catch (error: any) {
    if (error.message === 'Không tìm thấy bộ thẻ') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
}

export async function getTags(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Bạn chưa đăng nhập' });
    const tags = await deckService.getUserTags(req.user.id);
    return res.json({
      data: tags,
    });
  } catch (error) {
    next(error);
  }
}

export async function getDeckCards(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Bạn chưa đăng nhập' });
    const { deckId } = req.params;

    const cards = await cardService.getDeckCardsList(deckId, req.user.id);
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

export async function createCardInDeck(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Bạn chưa đăng nhập' });
    const { deckId } = req.params;
    const { front, back, imageUrl, frontLanguage, backLanguage } = req.body;

    const card = await cardService.createCardInDeck(deckId, req.user.id, { front, back, imageUrl, frontLanguage, backLanguage });

    return res.status(201).json({
      message: 'Tạo thẻ thành công',
      data: card,
    });
  } catch (error: any) {
    if (error.message === 'Mặt trước và mặt sau không được để trống') {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === 'Không tìm thấy bộ thẻ') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
}
